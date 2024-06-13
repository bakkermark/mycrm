import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import {FirebaseError} from '@firebase/util';

admin.initializeApp()

const db = admin.firestore()

// --------------------------------------------------------------------------
// FUNCTION: getUsers
// --------------------------------------------------------------------------
export const getUsers = functions.https.onCall(async () => {
  const userList: Record<string, unknown>[] = []
  const listUsersResult = await admin.auth().listUsers()

  for (const authUser of listUsersResult.users) {
    const userEmail = authUser.email || ''

    const userSnapshot = await db.collection('Users')
      .where('email', '==', userEmail)
      .get()

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]
      const userData = userDoc.data()

      userList.push({
        authUser,
        ...userData,
      })
    }
  }

  console.log("In total " + userList.length.toString() + " user(s) in response.")
  return userList
})

// --------------------------------------------------------------------------
// FUNCTION: changeUserStatus
// --------------------------------------------------------------------------
export const changeUserStatus
  = functions.https.onCall(async (data, context) => {
  if (!(context.auth && context.auth.uid)) {
    return {
      success: false,
      message: 'You must be logged in to execute this action.',
    }
  }
  if (!data) {
    return {
      success: false,
      message:
        'An error occurred in the application. Please contact support desk.',
    }
  }

  const { uid, enable } = data
  const userAuth = context.auth?.uid
  const userSnapshot = await db.collection('Users').doc(userAuth).get()
  const userData = userSnapshot.data()
  if (!(userData && ['SuperAdmin', 'Admin'].includes(userData.role))) {
    return {
      success: false,
      message: 'You do not have the required permissions.',
    }
  }

  const targetUserSnapshot = await db.collection('Users').doc(uid).get()
  const targetUserData = targetUserSnapshot.data()

  if (userData.role === 'Admin' && targetUserData
    && userData.licenseCode !== targetUserData.licenseCode) {
    return {
      success: false,
      message: 'You do not have the required permissions.',
    }
  }

  const newStatus = enable ? 'Active' : 'Inactive'

  //TODO Put in try catch block.
  await admin.auth().updateUser(uid, { disabled: !enable })
  await db.collection('Users').doc(uid).update({ status: newStatus })

  let message = 'User status has been changed'
  if (newStatus === 'Active')
    message = 'User is successfully enabled'
  else if (newStatus === 'Inactive')
    message = 'User is successfully disabled'

  return {
    success: true,
    message,
  }
})

// --------------------------------------------------------------------------
// FUNCTION: deleteUser
// --------------------------------------------------------------------------
export const deleteUser = functions.https.onCall(async (data, context) => {
  const { uid } = data
  if (!(context.auth && context.auth.uid)) {
    return {
      success: false,
      message: 'You must be logged in to execute this action.',
    }
  }

  try {
    const userCollection = db.collection('Users')
    let userAuthId = ''
    if (context.auth)
      userAuthId = context.auth.uid

    const userAuthSnapshot = await userCollection.doc(userAuthId).get()
    const userAuthData = userAuthSnapshot.data()
    if (!userAuthData) {
      return {
        success: false,
        message: 'Could not find the user that is loggedin. Please contact support desk.',
      }
    }
    if (userAuthData.role !== 'SuperAdmin') {
      return {
        success: false,
        message: 'You do not have the required role to delete a user.'
      }
    }

    const userSnapshot = await userCollection.doc(uid).get()
    const userData = userSnapshot.data()
    if (!userData) {
      return {
        success: false,
        message: 'User can not be found.',
      };
    }

    const userLicenseCode = userData.licenseCode
    if (userLicenseCode) {
      const licenseDocRef = db.collection('Licenses').doc(userLicenseCode)
      await licenseDocRef.update({
        countUsers: admin.firestore.FieldValue.increment(-1)
      })
      console.log("License " + userLicenseCode + " countUsers decremented.")
    }

    await admin.auth().deleteUser(uid)
    console.log("User " + userData.fullName + " deleted from FB Auth.")
    await db.collection('Users').doc(uid).delete()
    console.log("User " + userData.fullName + " deleted from Users collection.")

    // If avatar doesn't exist, no need for deletion
    if (!userData.avatar) {
      return {
        success: true,
        message: 'User deleted successfully',
      };
    }

    // Extract the file name from the avatar URL
    let avatarPathUrl = userData.avatar;
    avatarPathUrl = avatarPathUrl.split('/o/')[1];
    avatarPathUrl = avatarPathUrl.split('?alt=media')[0];
    avatarPathUrl = decodeURIComponent(avatarPathUrl);
    const bucket = admin.storage().bucket();

    // Delete avatar image from Firebase Storage
    console.log("Avatar " +  avatarPathUrl + " of user " + userData.fullName + " being deleted ...")
    await bucket.file(avatarPathUrl).delete();

    return {
      success: true,
      message: 'User deleted successfully',
    }
  }
  catch (error) {
    let errorMessage = 'Unexpected error occurred.'
    if (error instanceof Error) {
      errorMessage = `Error deleting user. Detail: ${error.message}`
    }
    console.error(errorMessage)
    return {
      success: false,
      message: errorMessage,
    }
  }
})

// --------------------------------------------------------------------------
// FUNCTION: addUser
// --------------------------------------------------------------------------
export const addUser = functions.https.onCall(async (data, context) => {
  const { email, password, licenseCode } = data;

  if (!(context.auth && context.auth.uid)) {
    return {
      success: false,
      message: 'You must be logged in to execute this action.',
    };
  }
  try {
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      const authError = error as FirebaseError;
      console.error('Email check in Auth: ' + error);
      if (authError.code !== "auth/user-not-found") {
        throw authError;
      }
    }
    console.log("User: " + user)
    if (user) {
      return {
        success: false,
        message: "A user with this email already exists.",
      };
    }
    const userRecord = await admin.auth().createUser({ email, password });

    if (licenseCode) {
      const licenseDocRef = db.collection('Licenses').doc(licenseCode)
      await licenseDocRef.update({
        countUsers: admin.firestore.FieldValue.increment(1)
      })
      console.log("License " + licenseCode + " countUsers incremented.")
    }

    return {
      success: true,
      message: "Successfully created new user.",
      returnValue: userRecord.uid
    };
  } catch (error: unknown) {
    console.error("User could not be added. " + error);
    let errorMsg = "Error creating new user. Unknown error";
    if (error instanceof Error) {
      errorMsg = `Error creating new user. ${error.message}`
    }
    return {
      success: false,
      message: errorMsg
    };
  }
});

// --------------------------------------------------------------------------
// FUNCTION: updateUserPassword
// --------------------------------------------------------------------------
export const updateUserPassword = functions.https.onCall(async (data, context) => {
  const { uid, newPassword } = data;

  if (!(context.auth && context.auth.uid)) {
    return {
      success: false,
      message: 'You must be logged in to execute this action.',
    };
  }

  const userCollection = db.collection('Users')
  let userAuthId = ''
  if (context.auth)
    userAuthId = context.auth.uid

  let userAuthData;
  try {
    const userAuthSnapshot = await userCollection.doc(userAuthId).get()
    userAuthData = userAuthSnapshot.data();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      message: 'Could not find the user that is loggedin. Please contact support desk.',
    };
  }

  if (!userAuthData || userAuthData.role !== 'SuperAdmin') {
    return {
      success: false,
      message: 'You do not have the required role to update a password of a user.'
    }
  }

  // Update password in Firebase Auth
  try {
    // Update password in Firebase Auth
    await admin.auth().updateUser(uid, {
      password: newPassword
    });

    return {
      success: true,
      message: 'Password of user has been updated successfully.'
    };
  } catch (error) {
    console.error('Error updating password:', error);
    return {
      success: false,
      message: 'An error occurred while updating the password. Details: ' + error
    };
  }
});

// --------------------------------------------------------------------------
// FUNCTION: sendEmail
// --------------------------------------------------------------------------
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export const sendEmail = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    console.log("User is not authenticated to sent email.")
    return { success: false, message: 'User is not authenticated.' };
  }
  else {
    // Assuming the MailerSend API key is stored in Firebase environment configuration
    const mailerSend = new MailerSend({
      apiKey: 'mlsn.02eb112fae569c21f9611c32d3f0affaa30f83ed5add050ad44e0f7f4f8dab03' //functions.config().mailersend.apikey,
    });

    const sentFrom = new Sender(data.fromEmail, data.fromEmailName);
    const recipients = [new Recipient(data.toEmail, data.toEmailName)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(data.subject)
      .setHtml(data.html)

    try {
      const result = await mailerSend.email.send(emailParams);
      const messageId = result.headers['x-message-id'];
      //TODO EmailsSend should be subcollection of licenses. Every license has own archive.
      const collectionPath = 'Licenses/' + data.licenseId + '/EmailArchive';
      const documentRef = db.collection(collectionPath).doc(messageId);
      await documentRef.set({
        messageId: messageId,
        fromEmail: data.fromEmail,
        fromEmailName: data.fromEmailName,
        toEmail: data.toEmail,
        toEmailName: data.toEmailName,
        subject: data.subject,
        html: data.html,
        sendDateTime: new Date(),
        status: 'Send',
      });
      console.log("Email archived in " + collectionPath + " under id " + messageId)
      return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error('Error processing email:', error);
      return { success: false, message: 'Email processing error occured. Details: ' + error };
    }
  }
});
// --------------------------------------------------------------------------
// FUNCTION: getIpInfo
// --------------------------------------------------------------------------
import IPinfoWrapper, { IPinfo } from "node-ipinfo";
import * as cors from 'cors';

// Initialize the IPinfoWrapper with your token
const ipinfoWrapper = new IPinfoWrapper("49b4494ac156b1");

// Initialize cors with the default configuration - allow requests from any origin
const corsHandler = cors({origin: true});
// Define your Cloud Function
exports.addLogin = functions.https.onRequest((req, res) => {
  // Use the cors middleware
  corsHandler(req, res, async () => {
    // Ensure the request is a POST
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // The rest of your function logic remains the same...
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("IP-address: " + ip);

    if (Array.isArray(ip)) {
      ip = ip[0];
    } else {
      // @ts-ignore
      ip = ip.split(',')[0].trim();
    }

    const { licenseId, userId, browser, browserVersion, os, osVersion, device, deviceType } = req.body;

    if (!licenseId || !userId) {
      res.status(400).send('Missing licenseId or userId');
      return;
    }

    try {
      const response: IPinfo = await ipinfoWrapper.lookupIp(ip);
      const { city, region, country, loc } = response;

      const loginData = {
        ipAddress: ip,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        city,
        region,
        country,
        location: loc,
        browser,
        browserVersion,
        os,
        osVersion,
        device,
        deviceType
      };

      await db.collection(`Licenses/${licenseId}/Logins`).add(loginData);

      res.status(200).json({ result: 'Login added successfully' });
    } catch (error) {
      console.error('Error adding login:', error);
      res.status(500).send('Error adding login');
    }
  });
});

// --------------------------------------------------------------------------
// FUNCTION: updateUserEmail
// --------------------------------------------------------------------------
exports.updateUserEmail = functions.https.onCall(async (data, context) => {
  try {
    // Ensure the user is authenticated.
    if (!context.auth) {
      return {
        success: false,
        message: 'You must be logged in to execute this action.',
      };
    }
    console.log("User has authorization to execute this function.")

    // Ensure you received correct parameters.
    console.log("data.email: " + data.email)
    console.log("data.uid: " + data.uid)
    if (!data.email || !data.uid) {
      return {
        success: false,
        message: 'User email can not be updated. Contact helpdesk.',
      };
    }
    console.log("Correct parameters are passed.")

    // Update the user.
    console.log("Start updating email ...")
    await admin.auth().updateUser(data.uid, {email: data.email});
    console.log("User email has been updated.")

    // Return a success message.
    console.log("User email updated succesfully. ")
    return { success: true, message: 'User email updated successfully.', };
  } catch (error) {
    console.error('Error updating user email:', error);
    return { success: false, message: 'Error updating user email. Details: ' + error };
  }
});

// --------------------------------------------------------------------------
// FUNCTION: generateHtmlThumbnail
// --------------------------------------------------------------------------
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
import { v4 as uuidv4 } from 'uuid';

exports.generateHtmlThumbnail = functions
  .runWith({ memory: '1GB' }) // Adjust memory allocation as needed
  .firestore
  .document('/EmailTemplates/{docId}')
  .onWrite(async (change, context): Promise<void> => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Only proceed if htmlTemplate has changed
    if (beforeData && afterData && beforeData.htmlTemplate === afterData.htmlTemplate) {
      console.log("No change in htmlTemplate. Exiting function.");
      return; // Return early if htmlTemplate hasn't changed
    }

    // Start Puppeteer browser
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    console.log("Write action triggered, htmlTemplate has changed.");
    const page = await browser.newPage();
    if (!afterData) {
      console.log("Document data is undefined.");
      await browser.close();
      return;
    }
    const htmlContent = afterData.htmlTemplate;
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const screenshotBuffer = await page.screenshot({ type: 'jpeg' });
    await browser.close();

    // Access the Firebase Admin SDK bucket
    const bucket = admin.storage().bucket('dev-mycrm.appspot.com');
    const fileName = `thumbnails/${context.params.docId}.jpg`;
    const file = bucket.file(fileName);

    // Generate a unique token for image access
    const token = uuidv4();

    // Save the screenshot with Firebase Admin SDK
    await file.save(screenshotBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    // Compose URL with token for authenticated access
    const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/dev-mycrm.appspot.com/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

    // Update Firestore document with the URL of the thumbnail
    await change.after.ref.set({ htmlThumbnail: thumbnailUrl }, { merge: true });

    console.log("Data saved in field htmlThumbnail.");
  });


// --------------------------------------------------------------------------
// FUNCTION: helloWorld
// --------------------------------------------------------------------------
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send('Hello world!');
});

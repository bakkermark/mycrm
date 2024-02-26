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
  const { email, password } = data;
  console.log("Email: " + email)
  console.log("Password: " + password)
  console.log("Auth uid: " + context.auth?.uid)
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

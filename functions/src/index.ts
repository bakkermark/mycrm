import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
admin.initializeApp();
const db = admin.firestore();

export const getUsers = functions.https.onCall(async () => {
  const userList: Record<string, unknown>[] = [];

  const listUsersResult = await admin.auth().listUsers();
  for (const authUser of listUsersResult.users) {
    const userEmail = authUser.email || "";

    const userSnapshot = await db.collection("Users")
      .where("email", "==", userEmail)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      userList.push({
        authUser,
        ...userData,
      });
    }
  }

  return userList;
});

export const changeUserStatus =
  functions.https.onCall(async (data, context) => {
    if (!data) {
      return {
        success: false,
        message: "An error occurred in the application. Contact support desk.",
      };
    }
    const {uid, enable} = data;
    const callerUid = context.auth?.uid;
    if (!callerUid) {
      return {
        success: false,
        message: "You must be logged in to execute this action.",
      };
    }
    const callerSnapshot = await db.collection("Users").doc(callerUid).get();
    const callerData = callerSnapshot.data();
    if (!(callerData && ["SuperAdmin", "Admin"].includes(callerData.role))) {
      return {
        success: false,
        message: "You do not have the required permissions " +
          "to change the status of users",
      };
    }
    const targetUserSnapshot = await db.collection("Users").doc(uid).get();
    const targetUserData = targetUserSnapshot.data();
    if (callerData.role === "Admin" && targetUserData &&
      callerData.licenseCode !== targetUserData.licenseCode) {
      return {
        success: false,
        message: "Admins can only change the status of " +
          "users with the same licenseCode",
      };
    }
    const newStatus = enable ? "Active" : "Inactive";
    await admin.auth().updateUser(uid, {disabled: !enable});
    await db.collection("Users").doc(uid).update({status: newStatus});
    let message = "User status has been changed";
    if (newStatus === "Active") {
      message = "User is successfully enabled.";
    } else if (newStatus === "Inactive") {
      message = "User is successfully disabled.";
    }
    return {
      success: true,
      message: message,
    };
  });

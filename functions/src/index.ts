import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const getUsers = functions.https.onCall(
  async (): Promise<Record<string, unknown>[]> => {
    const userList: Record<string, unknown>[] = [];
    const listUsersResult = await admin.auth().listUsers();

    for (const userRecord of listUsersResult.users) {
      const userJson = userRecord.toJSON() as admin.auth.UserRecord;
      const userSnapshot = await db.collection("Users")
        .where("Email", "==", userJson.email).get();

      userSnapshot.forEach((doc) => {
        userList.push({...userJson, extra: doc.data()});
      });
    }

    return userList;
  }
);

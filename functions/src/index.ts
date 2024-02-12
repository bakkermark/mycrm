import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getUsers = functions.https.onCall(
  async (): Promise<admin.auth.UserRecord[]> => {
    const userList: admin.auth.UserRecord[] = [];
    await admin
      .auth()
      .listUsers()
      .then((result) => {
        result.users.forEach((userRecord) => {
          userList.push(userRecord.toJSON() as admin.auth.UserRecord);
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return userList;
  }
);

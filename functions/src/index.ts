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
      .where("Email", "==", userEmail)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      if (userData && userData.LicenseCode) {
        const licenseSnapshot = await db.collection("Licenses")
          .doc(userData.LicenseCode)
          .get();

        if (licenseSnapshot.exists) {
          const licenseData = licenseSnapshot.data();
          if (licenseData && licenseData.LicenseeCompany) {
            const companyData = {LicenseeCompany: licenseData.LicenseeCompany};
            userList.push({
              authUser,
              userData,
              company: companyData,
            });
          }
        }
      }
    }
  }

  return userList;
});

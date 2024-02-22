import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

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

  return userList
})

// --------------------------------------------------------------------------
// FUNCTION: changeUserStatus
// --------------------------------------------------------------------------
export const changeUserStatus
  = functions.https.onCall(async (data, context) => {
    if (!data) {
      return {
        success: false,
        message:
          'An error occurred in the application. Contact support desk.',
      }
    }

    const { uid, enable } = data
    const callerUid = context.auth?.uid

    if (!callerUid) {
      return {
        success: false,
        message: 'You must be logged in to execute this action.',
      }
    }

    const callerSnapshot = await db.collection('Users').doc(callerUid).get()

    const callerData = callerSnapshot.data()

    if (!(callerData && ['SuperAdmin', 'Admin'].includes(callerData.role))) {
      return {
        success: false,
        message: 'You do not have the required permissions'
          + ' to change the status of users',
      }
    }

    const targetUserSnapshot = await db.collection('Users').doc(uid).get()
    const targetUserData = targetUserSnapshot.data()

    if (callerData.role === 'Admin' && targetUserData
      && callerData.licenseCode !== targetUserData.licenseCode) {
      return {
        success: false,
        message: 'Admins can only change the status of'
          + ' users with the same licenseCode',
      }
    }

    const newStatus = enable ? 'Active' : 'Inactive'

    await admin.auth().updateUser(uid, { disabled: !enable })
    await db.collection('Users').doc(uid).update({ status: newStatus })

    let message = 'User status has been changed'

    if (newStatus === 'Active')
      message = 'ChangeUserStatus.Message1'
    else if (newStatus === 'Inactive')
      message = 'ChangeUserStatus.Message2'

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
    let docId = ''
    if (context.auth)
      docId = context.auth.uid

    const callerSnapshot = await userCollection.doc(docId).get()
    const callerData = callerSnapshot.data()
    if (!callerData) {
      return {
        success: false,
        message: 'You do not have the required permissions'
          + ' to delete a user. CallerData not available.',
      }
    }
    if (callerData.role !== 'SuperAdmin') {
      return {
        success: false,
        message: 'You do not have the required role'
          + ` to delete a user. Role: ${callerData.role
          } Uid:${context.auth.uid
          } Name: ${callerData.fullName}`,
      }
    }
    await admin.auth().deleteUser(uid)
    await db.collection('Users').doc(uid).delete()

    return {
      success: true,
      message: 'User deleted successfully',
    }
  }
  catch (error) {
    let errorMessage = 'Unexpected error occurred.'
    if (error instanceof Error) {
      errorMessage
        = `Error deleting user. Detail: ${
          error.message}`
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
})

// --------------------------------------------------------------------------
// FUNCTION: addUser
// --------------------------------------------------------------------------
export const addUser = functions
  .https.onCall(async (data, context) => {
    const { email, password } = data
    try {
      // Check if the user is authenticated in the client app
      if (!context.auth) {
        return {
          success: false,
          message: 'User must be authenticated',
        }
      }

      // Fetch the role of the user invoking this function
      const userSnapshot
        = await admin.firestore().collection('Users').doc(context.auth.uid).get()

      if (!userSnapshot.exists) {
        return {
          success: false,
          message: 'Current user\'s data could not be fetched. Contact support desk.',
        }
      }

      const userRole = userSnapshot.data()?.role

      // Check if the user has the 'SuperAdmin' role
      if (userRole !== 'SuperAdmin') {
        return {
          success: false,
          message: 'Only users authenticated and with role SuperAdmin can add users.',
        }
      }

      // Use the Firebase Admin SDK to create a new user
      const userRecord = await admin.auth().createUser({
        email,
        password,
      })

      // Return the uid of the newly created user along with success message
      return {
        success: true,
        message: 'User has been created successfully',
        returnValue: userRecord.uid, // Using generic "returnValue" instead of "userId"
      }
    }
    catch (error) {
      console.error('Error creating new user: ', error)

      return {
        success: false,
        message: 'An error occurred while creating the user. Contact support desk.',
      }
    }
  })

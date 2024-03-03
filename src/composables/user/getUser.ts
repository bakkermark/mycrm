import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { User } from '@/types/userType';
import {ApiResponse} from "@/types/apiResponseType";

export default async (id: string): Promise<ApiResponse<User>> => {
  const successMessage_1 = 'User loaded successfully.'
  const errorMessage_1 = 'Could not find user. Please contact support.'
  const errorMessage_2 = 'Error in fetching data.'
  const fireStoreCollection = 'Users'

  try {
    const collectionReference = collection(projectFirestore, fireStoreCollection);
    const dataQuery = query(
      collectionReference,
      where("id", "==", id)
    );
    const dataSnapshots = await getDocs(dataQuery);
    if (!dataSnapshots.empty) {
      const returnObject = dataSnapshots.docs[0].data() as User;
      return { success: true, message: successMessage_1, returnObject: returnObject };
    } else {
      return { success: false, message: errorMessage_1 };
    }
  } catch (err:any) {
    return { success: false, message: errorMessage_2, details: `${err.message}` };
  }
};

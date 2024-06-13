import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { TriviaQuestion } from '@/types/emailTemplateType';
import {ApiResponse} from "@/types/apiResponseType";

export default async (templateName: string, licenseId: string): Promise<ApiResponse<TriviaQuestion>> => {
  const successMessage_1 = 'Email template loaded successfully.'
  const errorMessage_1 = 'Could not find the correct email template. Please contact support.'
  const errorMessage_2 = 'Error in fetching data.'
  const fireStoreCollection = 'EmailTemplates'
  
  try {    
    const collectionReference = collection(projectFirestore, fireStoreCollection);
    const dataQuery = query(
      collectionReference,
      where("templateName", "==", templateName),
      where("licenseCode", "==", licenseId)
    );
    const dataSnapshots = await getDocs(dataQuery);
    if (!dataSnapshots.empty) {
      const returnObject = dataSnapshots.docs[0].data() as TriviaQuestion;
      return { success: true, message: successMessage_1, returnObject: returnObject };
    } else {
      return { success: false, message: errorMessage_1 };
    }
  } catch (err:any) { 
    return { success: false, message: errorMessage_2, details: `${err.message}` };
  }
};

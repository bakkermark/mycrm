import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { EmailTemplate } from '@/types/emailTemplateType';
import {ApiResponse} from "@/types/apiResponseType";

export default async (templateName: string, licenseCode: string): Promise<ApiResponse<EmailTemplate>> => {
  const successMessage_1 = 'Email template loaded successfully.'
  const errorMessage_1 = 'Could not find the correct email template. Please contact support.'
  const errorMessage_2 = 'Error in fetching data.'
  const fireStoreCollection = 'EmailTemplates'
  
  try {
    const collectionReference = collection(projectFirestore, fireStoreCollection);
    const dataQuery = query(
      collectionReference,
      where("templateName", "==", templateName),
      where("licenseCode", "==", licenseCode)
    );
    const dataSnapshots = await getDocs(dataQuery);
    if (!dataSnapshots.empty) {
      const returnObject = dataSnapshots.docs[0].data() as EmailTemplate;
      return { success: true, message: successMessage_1, returnObject: returnObject };
    } else {
      return { success: false, message: errorMessage_1 };
    }
  } catch (err:any) { // define the type of err as `any` to be able to access `message` property
    return { success: false, message: errorMessage_2, details: `${err.message}` }; // corrected string templating here
  }
};

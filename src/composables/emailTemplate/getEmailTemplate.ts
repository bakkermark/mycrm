import { Ref, ref } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { EmailTemplate } from './emailTemplateType';

const getEmailTemplate = (templateName: string, licenseCode: string) => {
  const firebaseCollectionName = "EmailTemplates"
  const template: Ref<EmailTemplate | null> = ref(null);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(
        collectionReference,
        where("templateName", "==", templateName),
        where("licenseCode", "==", licenseCode)
      );
      const dataSnapshots = await getDocs(dataQuery);

      if (!dataSnapshots.empty) {
        template.value = dataSnapshots.docs[0].data() as EmailTemplate;
      }
    } catch (err) {
      error.value = (err as Error).message;
      console.log(`Error fetching data: ${error.value}`);
    }
  };

  return { template, error, load };
};

export default getEmailTemplate;

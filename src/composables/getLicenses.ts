import { Ref, ref } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, orderBy, DocumentSnapshot } from 'firebase/firestore';
import firebase from 'firebase/compat/app';

interface Data {
  id: string;
  Code: string;
  company?: string;
}

const getLicenses = () => {
  const firebaseCollectionName = "Licenses"
  const licenses: Ref<Data[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(collectionReference, orderBy("company"));
      const dataSnapshots = await getDocs(dataQuery);

      licenses.value = dataSnapshots.docs.map((doc: DocumentSnapshot<firebase.firestore.DocumentData>) => {
        const docData = doc.data();
        if (!docData) return {id: '', Code: '', Company: ''} as Data;
        return { ...docData, id: doc.id, company: docData.company } as Data;
      });

      // Log the count of records in licenses
      //console.log(`Retrieved ${licenses.value.length} records.`);

      // Log the Company field for each record in licenses
      //licenses.value.forEach((record, index) => {
      //  console.log(`Record ${index + 1} Company: ${record.Company}`);
      //});

    } catch (err) {
      error.value = (err as Error).message;
      console.log(`Error fetching data: ${error.value}`);
    }
  };

  return { licenses, error, load };
};

export default getLicenses;

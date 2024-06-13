import { Ref, ref } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, orderBy, DocumentSnapshot } from 'firebase/firestore';
import firebase from 'firebase/compat/app';

interface Data {
  id: string;
  Name: string;
  Description: string;
  Sorting: number;
}

const getTriviaCategories = () => {
  const firebaseCollectionName = "TriviaCategories_nl";
  const data: Ref<Data[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(collectionReference, orderBy("Name"));
      const dataSnapshots = await getDocs(dataQuery);
      data.value = dataSnapshots.docs.map((doc: DocumentSnapshot<firebase.firestore.DocumentData>) => {
        const docData = doc.data();
        if (!docData) return { id: '', Name: '' } as Data;
        return { ...docData, id: doc.id, Name: docData.Name } as Data;
      });
      console.log("Loaded categories in api:", data.value); // Debugging line
    } catch (err) {
      error.value = (err as Error).message;
      console.log(`Error fetching data: ${error.value}`);
    }
  };

  return { data, error, load };
};

export default getTriviaCategories;

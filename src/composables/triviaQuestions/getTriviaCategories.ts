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
  const triviaCategories: Ref<Data[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(collectionReference, orderBy("Sorting"));
      const dataSnapshots = await getDocs(dataQuery);
      triviaCategories.value = dataSnapshots.docs.map((doc: DocumentSnapshot<firebase.firestore.DocumentData>) => {
        const docData = doc.data();
        if (!docData) return '';
        return docData.Name;
      });
    } catch (err) {
      error.value = (err as Error).message;
      console.log(`Error fetching data: ${error.value}`);
    }
  };

  return { triviaCategories, error, load };
};

export default getTriviaCategories;

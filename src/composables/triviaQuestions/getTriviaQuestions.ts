import { Ref, ref } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, orderBy, DocumentSnapshot } from 'firebase/firestore';
import firebase from 'firebase/compat/app';

interface Data {
  id: string;
  Code: string;
  company?: string;
}

const getTriviaQuestions = () => {
  const firebaseCollectionName = "TriviaQuestions_nl"
  const data: Ref<Data[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(collectionReference, orderBy("Category"));
      const dataSnapshots = await getDocs(dataQuery);
      data.value = dataSnapshots.docs.map((doc: DocumentSnapshot<firebase.firestore.DocumentData>) => {
        const docData = doc.data();
        if (!docData) return {id: ''} as Data;
        return { ...docData, id: doc.id } as Data;
      });
    } catch (err) {
      error.value = (err as Error).message;
      console.log(`Error fetching data: ${error.value}`);
    }
  };

  return { triviaQuestions: data, error, load };
};

export default getTriviaQuestions;

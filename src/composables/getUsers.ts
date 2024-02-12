import { Ref, ref } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { collection, getDocs, query, orderBy, DocumentSnapshot } from 'firebase/firestore';
import firebase from 'firebase/compat/app';

interface Data {
  id: string;
  Code: string;
}

const getData = () => {
  const firebaseCollectionName = "Users"
  const data: Ref<Data[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(collectionReference, orderBy('LastName', 'asc'));
      const dataSnapshots = await getDocs(dataQuery);
      data.value = dataSnapshots.docs.map((doc: DocumentSnapshot<firebase.firestore.DocumentData>) => {
        const docData = doc.data();

        return { ...docData, id: doc.id } as Data;
      });
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  return { users: data, error, load };
};

export default getData;

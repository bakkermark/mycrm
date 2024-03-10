import { Ref, ref } from 'vue';
import { collection, getDocs, query, orderBy, limitToLast, where } from 'firebase/firestore';
import { projectFirestore } from '@/firebase/config';
import { UserLogin } from '@/types/userLoginType';

const getData = (licenseId: string, userId: string) => {
  const firebaseCollectionName = `Licenses/${licenseId}/Logins`;
  const data: Ref<UserLogin[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(
        collectionReference,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitToLast(10)
      );
      
      const dataSnapshots = await getDocs(dataQuery);

      data.value = dataSnapshots.docs.map((doc) => {
        const docData = doc.data() as any; // Here we are casting doc.data() to any type
        return {
          ...docData,
          id: doc.id,
          createdAt: `${docData.createdAt.toDate().toLocaleDateString()} ${docData.createdAt.toDate().toLocaleTimeString().substring(0, 5)}` // Here we are converting the createdAt timestamp from Firestore to a formatted string
        } as UserLogin;
      });
    } catch (err) {
      console.log("Error: " + err);
      error.value = (err as Error).message;
    }
  };

  return { data, error, load };
};

export default getData;

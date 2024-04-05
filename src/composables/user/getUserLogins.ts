import { Ref, ref } from 'vue';
import { collection, getDocs, query, orderBy, limitToLast, where } from 'firebase/firestore';
import { projectFirestore } from '@/firebase/config';
import { UserLogin } from '@/types/userLoginType';

const getData = (licenseId: string, userId: string) => {
  const firebaseCollectionName = `Licenses/${licenseId}/Logins`;
  const data: Ref<UserLogin[]> = ref([]);
  const error: Ref<string | null> = ref(null);

  console.log("Getting data for " + userId + " with licenseId " + licenseId + " from " + firebaseCollectionName)

  const load = async () => {
    try {
      const collectionReference = collection(projectFirestore, firebaseCollectionName);
      const dataQuery = query(
        collectionReference,
        where('userId', '==', userId),
        orderBy('createdAt'),
        limitToLast(10)
      );

      const dataSnapshots = await getDocs(dataQuery);
      data.value = dataSnapshots.docs
        .map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id,
            userId: docData.userId,
            createdAt: docData.createdAt.toDate(),
            createdAtFormatted: `${docData.createdAt.toDate().toLocaleDateString()} ${docData.createdAt.toDate().toLocaleTimeString().substring(0, 5)}`, // Here we are converting the createdAt timestamp from Firestore to a formatted string
            browser: docData.browser,
            os: docData.os,
            city: docData.city,
            region: docData.region,
            device: docData.device,
            ipAddress: docData.ipAddress,
            deviceType: docData.deviceType,
            osVersion: docData.osVersion,
            country: docData.country,
            location: docData.location,
          } as UserLogin & {createdAtFormatted: string};
        })
        .reverse(); // Reverse the array to get the two latest entries in descending order
    } catch (err) {
      error.value = (err as Error).message;
    }
  };
  
  return { data, error, load };
};

export default getData;

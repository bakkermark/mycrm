<template>
  <div>
    <h1>User Details</h1>
    <div v-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>First Name:</strong> {{ user.firstName }}</p>
      <p v-if="user.infix"><strong>Infix:</strong> {{ user.infix }}</p>
      <p><strong>Last Name:</strong> {{ user.lastName }}</p>
      <p><strong>Full Name:</strong> {{ user.fullName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p><strong>Status:</strong> {{ user.status }}</p>
      <p v-if="user.avatar"><strong>Avatar:</strong> <img height="100" :src="user.avatar" alt="Avatar"></p>
      <p><strong>Created At:</strong>{{ formatDate(user.createdAt) }}</p>
      <p><strong>Company:</strong> {{ user.company }}</p>
      <p><strong>License Code:</strong> {{ user.licenseCode }}</p>
      <p><strong>Plan:</strong> {{ user.plan }}</p>
    </div>
    <p v-else-if="loading">Loading user data...</p>
    <p v-else-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { User } from './../userTypes'

const route = useRoute();
const userId = route.params.id.toString(); // Ensure userId is of type string
const user = ref<User | null>(null); // Specify type for user
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    const userDocRef = doc(projectFirestore, 'Users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      user.value = userDocSnap.data() as User; // Cast to User type
    } else {
      error.value = 'User not found';
    }
  } catch (err) {
    error.value = 'Error fetching user data';
    console.error('Error fetching user data:', err);
  } finally {
    loading.value = false;
  }
});

// Function to format createdAt timestamp
const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  return date.toLocaleString(); // Format date as desired
};
</script>

<style scoped lang="scss">
/* Add your custom styles here */
</style>

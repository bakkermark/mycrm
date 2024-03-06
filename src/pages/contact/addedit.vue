<template>
  <div>
    <h2>{{ isEditing ? 'Contact Bewerken' : 'Nieuw Contact Toevoegen' }}</h2>
    <div>
      <div v-if="isEditing">
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
    </div>
    <!-- Je formulier logica hier -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { projectFirestore } from '@/firebase/config';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../user/userTypes';

const route = useRoute();
const userId = ref<string | null>(null);
const user = ref<User | null>(null); // Specify type for user
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  userId.value = route.query.id as string | null;

  if (!userId.value) {
    error.value = 'User ID missing from route query';
    return;
  }

  loading.value = true;
  try {
    const userDocRef = doc(projectFirestore, 'Users', userId.value);
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

const contactId = ref<string>(route.query.id as string);
const isEditing = computed(() => contactId.value !== undefined && contactId.value !== '');
// Hier kun je logica toevoegen om:
// - Een nieuw contact toe te voegen als `isEditing` false is.
// - Een bestaand contact te bewerken (gebruikmakend van `contactId`) als `isEditing` true is.
</script>

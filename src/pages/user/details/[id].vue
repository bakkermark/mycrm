<template>
  <VRow v-if="user">
   <VCol cols="12">
  <VCard>
    <VImg
      :src="UserProfileHeaderBg"
      min-height="125"
      max-height="250"
      cover
    />

    <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-5">
      <div class="d-flex h-0">
        <VAvatar
          rounded
          size="120"
          :image="user.avatar as string"
          class="user-profile-avatar mx-auto"
        />
      </div>

      <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
        <h5 class="text-h5 text-center text-sm-start font-weight-medium mb-3">
          {{ user.fullName as string }}
        </h5>

        <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-4">
          <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-4">
            <span class="d-flex">
              <VIcon
                size="20"
                icon="tabler-password-user"
                class="me-1"
              />
              <span class="text-body-1">
                {{ user.role }}
              </span>
            </span>

            <span class="d-flex">
              <VIcon
                size="20"
                icon="tabler-mail"
                class="me-1"
              />
              <span class="text-body-1">
                {{ user.email }}
              </span>
            </span>

            <span class="d-flex">
              <VIcon
                size="20"
                icon="tabler-calendar"
                class="me-1"
              />
              <span class="text-body-1">
                joined {{
                  (new Date(user.createdAt.seconds * 1000)).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric'
                  })
                }}
              </span>
            </span>
          </div>

          <VBtn prepend-icon="tabler-check">
            Connected
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
  </VCol>
  </VRow>
  
  <VRow v-if="user">
    <VCol cols="12">
    <VTabs
      v-model="currentTab"
      class="v-tabs-pill"
    >
      <VTab>
        <VIcon icon="tabler-user"/>
        Profile
      </VTab>
      <VTab>
        <VIcon icon="tabler-lock"/>
        Projects
      </VTab>
    </VTabs>
    </VCol>
  </VRow>

    <VRow v-if="user">
      <VCol cols="4">
        <VCard class="mb-4">
          <VCardText>
            <VWindow v-model="currentTab">
              <VWindowItem :value="0">
                <p class="text-xs">
                  USER INFO
                </p>
                <VList class="card-list text-medium-emphasis">
                  <VListItem>
                    <VIcon
                      icon="tabler-activity"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Status: </span>
                    <span>{{ user.status }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-user"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Firstname: </span>
                    <span>{{ user.firstName }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Infix: </span>
                    <span>{{ user.infix }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Lastname: </span>
                    <span>{{ user.lastName }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-calendar-plus"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Created: </span>
                    <span>{{ (new Date(user.createdAt.seconds * 1000)).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'}) }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-user-pin"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Role: </span>
                    <span>{{ user.role }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-flag"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Country: </span>
                    <span>{{ user.country }}</span>
                  </VListItem>
                  <p class="text-xs">
                    CONTACT INFO
                  </p>
                  <VListItem>
                    <VIcon
                      icon="tabler-device-mobile"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Mobile: </span>
                    <span>{{ user.mobile }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-phone"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Phone: </span>
                    <span>{{ user.phone }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-mail"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Email: </span>
                    <span>{{ user.email }}</span>
                  </VListItem>
                  <p class="text-xs">
                    BILLING INFO
                  </p>
                  <VListItem>
                    <VIcon
                      icon="tabler-building-skyscraper"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Company: </span>
                    <span>{{ user.company }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-certificate-2"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">Plan: </span>
                    <span>{{ user.plan }}</span>
                  </VListItem>
                  <VListItem>
                    <VIcon
                      icon="tabler-license"
                      size="20"
                      class="me-2"
                    />
                    <span class="font-weight-medium me-1">License code: </span>
                    <span>{{ user.licenseCode }}</span>
                  </VListItem>
                </VList>
              </VWindowItem>
              <VWindowItem :value="1">
                More to come ... 
              </VWindowItem>
            </VWindow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import {projectFirestore} from '@/firebase/config';
import {useRoute} from 'vue-router';
import {doc, getDoc} from 'firebase/firestore';
import {User} from './../userTypes'
import UserProfileHeaderBg from '@images/pages/user-profile-header-bg.png'

const route = useRoute();
const userId = route.params.id.toString(); // Ensure userId is of type string
const user = ref<User | null>(null); // Specify type for user
const loading = ref(false);
const error = ref<string | null>(null);
const currentTab = ref(0);

// tabs
const tabs = [
  {
    title: 'Profile',
    icon: 'tabler-user-check',
    tab: 'profile',
  },
  {
    title: 'Team',
    icon: 'tabler-users',
    tab: 'teams',
  },
  {
    title: 'Projects',
    icon: 'tabler-layout-grid',
    tab: 'projects',
  },
  {
    title: 'Connections',
    icon: 'tabler-link',
    tab: 'connections',
  },
]

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

<style lang="scss">
.user-profile-avatar {
  border: 5px solid rgb(var(--v-theme-surface));
  background-color: rgb(var(--v-theme-surface)) !important;
  inset-block-start: -3rem;

  .v-img__img {
    border-radius: 0.125rem;
  }
}
</style>

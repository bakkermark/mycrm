<script lang="ts" setup>
import {ref, computed, onMounted, watch } from 'vue';
import {VDataTableServer} from 'vuetify/labs/VDataTable'
import {paginationMeta} from '@/plugins/fake-api/utils/paginationMeta'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";

const { t } = useI18n();
const isLoading = ref(true)
const snackbar = useSnackbarStore();

// 👉 Store
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
interface Options {
  page: number;
  sortBy: { key: string; order: string }[];
}

watch(itemsPerPage, () => {
  page.value = 1;
});
const updateOptions = (options: Options) => {
  page.value = options.page;
  sortBy.value = options.sortBy[0]?.key;
  orderBy.value = options.sortBy[0]?.order;
}

// Headers
const headers = [
  {
    title: 'User',
    key: 'user',
  },
  {
    title: 'Company',
    key: 'company',
  },
  {
    title: 'Plan',
    key: 'plan',
  },
  {
    title: 'Role',
    key: 'role',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

// Status of user
const resolveTooltipActionIconUser = (status: string) => {
  const statusLowerCase = status.toLowerCase()
  if (statusLowerCase === 'active')
    return 'Disable user'
  if (statusLowerCase === 'inactive')
    return 'Enable user'
  return 'Enable user' // Default text if no match found
}

// Snackbar message
const snackbarColor = ref('success');
const isSnackbarVisible = ref(false);
const snackbarMessage = ref('');

// Enabling or disabling user
interface cloudFunctionResponse {
  success: boolean;
  message: string;
  returnValue: string;
}
const functions = getFunctions();
const changeUserStatus = httpsCallable(functions, 'changeUserStatus');
const changeUserStatusOnClick = async (uid: string, shouldEnable: boolean) => {
  const user = usersData.value.find(user => user.id === uid);
  if (!user) {
    snackbar.showSnackbar({ color: "error", message: t("No user found with this uid. Please contact support desk.") })
    return;
  }
  user.changeUserStatusLoading = true;
  const { data } = await changeUserStatus({ uid, enable: shouldEnable });
  const response = data as cloudFunctionResponse;
  if(response.success) {
    // If operation was successful, update status of the user in the local data
    user.status = shouldEnable ? 'Active' : 'Inactive';
    snackbar.showSnackbar({ color: "success", message: t(response.message) })
  } else {
    snackbar.showSnackbar({ color: "error", message: t(response.message) })
  }
  user.changeUserStatusLoading = false;
};

interface User {
  avatar: string;
  company: string;
  email: string;
  firstName: string;
  fullName: string;
  id: string
  infix: string;
  lastName: string;
  licenseCode: string;
  plan: string;
  role: string;
  status: string;
  changeUserStatusLoading: boolean;
  deleteUserLoading: boolean;
}
const usersData = ref<User[]>([]);
onMounted(async () => {
  const getUsers = httpsCallable(functions, 'getUsers');

  try {
    const result = await getUsers();
    usersData.value = (result.data as any[]).map(user => ({
      avatar: user.avatar,
      company: user.company,
      email: user.email,
      firstName: user.firstName,
      fullName: user.fullName,
      id: user.id,
      infix: user.infix,
      lastName: user.lastName,
      licenseCode: user.licenseCode,
      plan: user.plan,
      role: user.role,
      status: user.status,
      changeUserStatusLoading: false,
      deleteUserLoading: false,
    }));
  }
  catch (error) {
    console.log('Error getting users data: ', error); // Log any errors
  }
  finally {
    isLoading.value = false;
  }
});

const searchQuery = ref('') // this will track the value of the search input
const filteredUsers = computed(() => {
  let filtered = usersData.value;
  if (searchQuery.value || selectedRole.value || selectedPlan.value || selectedStatus.value) {
    filtered = usersData.value.filter(user =>
      (user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
      (!selectedRole.value || user.role === selectedRole.value) &&
      (!selectedPlan.value || user.plan === selectedPlan.value) &&
      (!selectedStatus.value || user.status === selectedStatus.value)
    );
  }

  // Consider the pagination
  const startIndex = (page.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  const pagedFilteredUsers = filtered.slice(startIndex, endIndex);

  return pagedFilteredUsers;
});

const totalUsers = computed(() => usersData.value.length);

// 👉 search filters
const roles = [
  {
    title: 'SuperAdmin',
    value: 'SuperAdmin',
  },
  {
    title: 'Admin',
    value: 'Admin',
  },
  {
    title: 'Standard User',
    value: 'Standard User',
  },
]

const plans = [
  {
    title: 'Basic',
    value: 'Basic',
  },
  {
    title: 'Extended',
    value: 'Extended',
  },
  {
    title: 'Platinum',
    value: 'Platinum',
  },
]

const status = [
  {
    title: 'Active',
    value: 'Active',
  },
  {
    title: 'Inactive',
    value: 'Inactive',
  },
]

const resolveUserRoleVariant = (role:string) => {
  const roleLowerCase = role.toLowerCase()
  if (roleLowerCase === 'superadmin')
    return {
      color: 'warning',
      icon: 'tabler-password-user',
    }
  if (roleLowerCase === 'admin')
    return {
      color: 'warning',
      icon: 'tabler-user-star',
    }
  if (roleLowerCase === 'standard user')
    return {
      color: 'secondary',
      icon: 'tabler-user',
    }

  return {
    color: 'secondary',
    icon: 'tabler-user',
  }
}

const resolveUserStatusVariant = (stat:string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'error'

  return 'primary'
}

const resolveActionIconUser = (status: string) => {
  const statusLowerCase = status.toLowerCase();

  if (statusLowerCase === 'inactive') return { color: 'success', icon: 'tabler-user-up' };

  return { color: 'error', icon: 'tabler-user-down' };
};

const deleteUser = async (id: string) => {
  const user = usersData.value.find(user => user.id === id);
  if (!user) {
    snackbar.showSnackbar({ color: "error", message: t("No user found with this uid. Please contact support desk.") })
    return;
  }
  
  user.deleteUserLoading = true;
  const functions = getFunctions(); // if you have not retrieved functions already
  const deleteUserFunction = httpsCallable(functions, 'deleteUser');
  try {
    const { data } = await deleteUserFunction({ uid: id });
    const response = data as cloudFunctionResponse;
    if(response.success) {
      // If operation was successful, remove user from local data
      usersData.value = usersData.value.filter(user => user.id !== id);
      snackbar.showSnackbar({ color: "success", message: t(response.message)});
    } else {
      snackbar.showSnackbar({ color: "error", message: t(response.message) });
    }
  } catch(error) {
    snackbar.showSnackbar({ color: "error", message: t("Error while performing deletion. Please contact support desk.")});
  } finally {
    user.deleteUserLoading = false;
  }
};

const router = useRouter();
const navigateToAddUser = () => {
  router.push({ name: 'user-add' });
};

const navigateToEditUser = (id: string) => {
  router.push({ path: '/user/add', query: { id: id } });
};

const widgetData = ref([
  {
    title: 'Session',
    value: '21,459',
    change: 29,
    desc: 'Total Users',
    icon: 'tabler-user',
    iconColor: 'primary',
  },
  {
    title: 'Paid Users',
    value: '4,567',
    change: 18,
    desc: 'Last Week Analytics',
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: 'Active Users',
    value: '19,860',
    change: -14,
    desc: 'Last Week Analytics',
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Pending Users',
    value: '237',
    change: 42,
    desc: 'Last Week Analytics',
    icon: 'tabler-user-exclamation',
    iconColor: 'warning',
  },
])
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template
          v-for="(data, id) in widgetData"
          :key="id"
        >
          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <span class="text-body-1 text-medium-emphasis">{{ data.title }}</span>
                    <div>
                      <h4 class="text-h4">
                        {{ data.value }}
                        <span
                          class="text-base "
                          :class="data.change > 0 ? 'text-success' : 'text-error'"
                        >({{ prefixWithPlus(data.change) }}%)</span>
                      </h4>
                    </div>
                    <span class="text-sm">{{ data.desc }}</span>
                  </div>
                  <VAvatar
                    :color="data.iconColor"
                    variant="tonal"
                    rounded
                    size="38"
                  >
                    <VIcon
                      :icon="data.icon"
                      size="26"
                    />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard
      title="Filters"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedRole"
              label="Select Role"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedPlan"
              label="Select Plan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              label="Select Status"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard>
      <VCardText class="d-flex flex-wrap py-4 gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 10rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search"
              density="compact"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-screen-share"
          >
            Export
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="navigateToAddUser"
          >
            Add New User
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="filteredUsers"
        :items-length="filteredUsers.length"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
        v-model:loading="isLoading"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center">

            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              :color="!item.avatar ? resolveUserRoleVariant(item.role).color : undefined"
              class="me-3"
            >
              <VImg
                v-if="item.avatar && item.avatar.startsWith('https://')"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.firstName + " " + item.lastName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <VTooltip
                  location="top"
                  activator="parent"
                >
                  Show profile user
                </VTooltip>
                <RouterLink
                  :to="{ name: 'user-details-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.fullName }}
                </RouterLink>
              </h6>
              <span class="text-sm text-medium-emphasis">{{ item.email }}</span>
            </div>
          </div>
        </template>

        <!-- Company -->
        <template #item.company="{ item }">
          <span class="text-capitalize font-weight-medium">{{ item.company }}</span>
        </template>

        <!-- 👉 Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center gap-4">
            <VAvatar
              :size="30"
              :color="resolveUserRoleVariant(item.role).color"
              variant="tonal"
            >
              <VIcon
                :size="20"
                :icon="resolveUserRoleVariant(item.role).icon"
              />
            </VAvatar>
            <span class="text-capitalize">{{ item.role }}</span>
          </div>
        </template>

        <!-- Plan -->
        <template #item.plan="{ item }">
          <span class="text-capitalize font-weight-medium">{{ item.plan }}</span>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label=""
            class="text-capitalize"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            :disabled="item.changeUserStatusLoading"
            v-if="!item.changeUserStatusLoading"
            @click="changeUserStatusOnClick(item.id, item.status === 'Inactive')"
          >
            <VTooltip
              location="top"
              activator="parent"
            >
              {{ resolveTooltipActionIconUser(item.status) }}
            </VTooltip>
            <VIcon :icon="resolveActionIconUser(item.status).icon" :color="resolveActionIconUser(item.status).color" />
          </IconBtn>
          <IconBtn
            v-else
          >
            <VProgressCircular
              :size="20"
              :width="2"
              indeterminate
            />
          </IconBtn>
          <IconBtn
            :disabled="item.deleteUserLoading"
            v-if="!item.deleteUserLoading"
            @click="deleteUser(item.id)">
            <VTooltip
              location="top"
              activator="parent"
            >
              Delete user
            </VTooltip>
            <VIcon icon="tabler-trash" />
          </IconBtn>
          <IconBtn
            v-else
          >
            <VProgressCircular
              :size="20"
              :width="2"
              indeterminate
            />
          </IconBtn>

          <IconBtn @click="navigateToEditUser(item.id)">
            <VTooltip
              location="top"
              activator="parent"
            >
              Edit user
            </VTooltip>
            <VIcon icon="tabler-edit" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="tabler-dots-vertical"
            />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'user-details-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>
                  <VListItemTitle>Show profile</VListItemTitle>
                </VListItem>
                <VListItem link="">
                  <template #prepend>
                    <VIcon icon="tabler-mail" />
                  </template>
                  <VListItemTitle>Send email</VListItemTitle>
                </VListItem>
                <VListItem @click="">
                  <template #prepend>
                    <VIcon icon="tabler-send" />
                  </template>
                  <VListItemTitle>Send password reset</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalUsers) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalUsers / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalUsers / itemsPerPage)"
            >
              <template #prev="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Previous
                </VBtn>
              </template>

              <template #next="slotProps">
                <VBtn
                  variant="tonal"
                  color="default"
                  v-bind="slotProps"
                  :icon="false"
                >
                  Next
                </VBtn>
              </template>
            </VPagination>
          </div>
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
  </section>
  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="3000"
    location="top end"
    transition="fade-transition"
    variant="flat"
    :color="snackbarColor"
  >
    {{ snackbarMessage }}
  </VSnackbar>
</template>

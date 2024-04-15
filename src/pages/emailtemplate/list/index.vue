<script lang="ts" setup>
import {ref, computed, onMounted, watch } from 'vue';
import {VDataTableServer} from 'vuetify/labs/VDataTable'
import {paginationMeta} from '@/plugins/fake-api/utils/paginationMeta'
import {getFunctions, httpsCallable} from 'firebase/functions';
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import {EmailTemplate} from "@/types/emailTemplateType";
import getEmailTemplates from '../../../composables/emailTemplate/getEmailTemplates';
import {Email} from "@/plugins/fake-api/handlers/apps/email/types";

const { t } = useI18n();
const isLoading = ref(true)
const snackbar = useSnackbarStore();

// 👉 Store
const selectedSubscriptionStatus = ref()
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
    title: 'Thumnail',
    key: 'htmlThumbnail',
  },
  {
    title: 'Name',
    key: 'templateName',
  },
  {
    title: 'Group',
    key: 'templateGroup',
  },
  {
    title: 'Created By',
    key: 'createdBy',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

// Snackbar message
const snackbarColor = ref('success');
const isSnackbarVisible = ref(false);
const snackbarMessage = ref('');

// Interface for the cloud function response
// TODO SHould this not be centralized?
interface cloudFunctionResponse {
  success: boolean;
  message: string;
  returnValue: string;
}

const functions = getFunctions();

const emailTemplatesData = ref<EmailTemplate[]>([]);
// Instantiate your composable
const getEmailTemplatesFunction = getEmailTemplates();

onMounted(async () => {
  await getEmailTemplatesFunction.load();

  if (getEmailTemplatesFunction.error.value) {
    console.log('Error getting emailTemplates: ', getEmailTemplatesFunction.error.value);
  } else {
    emailTemplatesData.value = getEmailTemplatesFunction.emailTemplates.value?.map((emailTemplatesData: any) => {
      return {
        ...emailTemplatesData,
        // Provide default values for required fields in case they don't exist in `emailTemplatesData`
        subject: emailTemplatesData.subject || '',
        htmlTemplate: emailTemplatesData.htmlTemplate || '',
        createdAt: emailTemplatesData.createdAt || '',
        description: emailTemplatesData.description || '',
        licenseCode: emailTemplatesData.licenseCode || '',
        templateGroup: emailTemplatesData.templateGroup || '',
        templateName: emailTemplatesData.templateName || '',
        updatedAt: emailTemplatesData.updatedAt || '',
        templateType: emailTemplatesData.templateType || '',
        createdBy: emailTemplatesData.createdBy || '',
        updatedBy: emailTemplatesData.updatedBy || '',
        lastEmailSent: emailTemplatesData.lastEmailSent || '',
        fromEmail: emailTemplatesData.fromEmail || '',
        fromEmailName: emailTemplatesData.fromEmailName || '',
        replyEmail: emailTemplatesData.replyEmail || '',
        replyEmailName: emailTemplatesData.replyEmailName || '',

      } as EmailTemplate; // Type cast the resulting object as 'EmailTemplate'
    }) || []; // Provide default empty array in case `emailTemplates.value` is undefined
  }
  isLoading.value = false;
});

const searchQuery = ref('') // this will track the value of the search input
const filteredEmailTemplates = computed(() => {
  let filtered = emailTemplatesData.value;
  if (searchQuery.value || selectedSubscriptionStatus.value || selectedPlan.value || selectedStatus.value) {
    filtered = emailTemplatesData.value.filter(emailTemplate =>
      (emailTemplate.templateName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emailTemplate.templateGroup.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        emailTemplate.description.toLowerCase().includes(searchQuery.value.toLowerCase())) 
      //&&
      //(!selectedSubscriptionStatus.value || license.subscriptionStatus === selectedSubscriptionStatus.value) &&
      //(!selectedPlan.value || license.plan === selectedPlan.value) &&
      //(!selectedStatus.value || license.status === selectedStatus.value)
    );
  }

  // Consider the pagination
  const startIndex = (page.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  const pagedFilteredEmailTemplates = filtered.slice(startIndex, endIndex);

  return pagedFilteredEmailTemplates;
});

const totalEmailTemplates = computed(() => emailTemplatesData.value.length);

// 👉 search filters
const subscriptionStatus = [
  {
    title: 'Active',
    value: 'Active',
  }
]

const plans = [
  {
    title: 'Basic',
    value: 'Basic',
  }
]

const status = [
  {
    title: 'Active',
    value: 'Active',
  }
]

const deleteLicense = async (id: string) => {
  // const license = licensesData.value.find(license => license.id === id);
  // if (!license) {
  //   snackbar.showSnackbar({ color: "error", message: t("No license found with this id. Please contact support desk.") })
  //   return;
  // }
  //
  // license.deleteLicenseLoading = true;
  // const functions = getFunctions(); // if you have not retrieved functions already
  // const deleteUserFunction = httpsCallable(functions, 'deleteUser');
  // try {
  //   const { data } = await deleteUserFunction({ uid: id });
  //   const response = data as cloudFunctionResponse;
  //   if(response.success) {
  //     // If operation was successful, remove user from local data
  //     licensesData.value = licensesData.value.filter(user => user.id !== id);
  //     snackbar.showSnackbar({ color: "success", message: t(response.message)});
  //   } else {
  //     snackbar.showSnackbar({ color: "error", message: t(response.message) });
  //   }
  // } catch(error) {
  //   snackbar.showSnackbar({ color: "error", message: t("Error while performing deletion. Please contact support desk.")});
  // } finally {
  //   license.deleteLicenseLoading = false;
  // }
};

const router = useRouter();
const navigateToAddLicense = () => {
  router.push({ name: 'license-add' });
};

const navigateToEditLicense = (id: string) => {
  router.push({ path: '/license/add', query: { id: id } });
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
              v-model="selectedSubscriptionStatus"
              label="Select subscription status"
              placeholder="Select subscription status"
              :items="subscriptionStatus"
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
            @click="navigateToAddLicense"
          >
            Add New Emailtemplate
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="filteredEmailTemplates"
        :items-length="filteredEmailTemplates.length"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
        v-model:loading="isLoading"
      >

        <template #item.htmlThumbnail="{ item }">
          <VImg
            v-if="item.htmlThumbnail && item.htmlThumbnail.startsWith('https://')"
            :src="item.htmlThumbnail"
          />
        </template>
        
        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            :disabled="item.changeUserStatusLoading"
            v-if="!item.changeUserStatusLoading">
            <VTooltip
              location="top"
              activator="parent"
            >
            </VTooltip>
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
            @click="deleteLicense(item.id)">
            <VTooltip
              location="top"
              activator="parent"
            >
              Delete license
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

          <IconBtn @click="navigateToEditLicense(item.id)">
            <VTooltip
              location="top"
              activator="parent"
            >
              Edit license
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
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
            <p class="text-sm text-disabled mb-0">
              {{ paginationMeta({page, itemsPerPage}, totalEmailTemplates) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalEmailTemplates / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalEmailTemplates / itemsPerPage)"
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

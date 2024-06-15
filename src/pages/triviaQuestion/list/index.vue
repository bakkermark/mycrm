<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import {VDataTableServer} from 'vuetify/labs/VDataTable'
import {paginationMeta} from '@/plugins/fake-api/utils/paginationMeta'
import {getFunctions} from 'firebase/functions';
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import {TriviaQuestion} from "@/types/triviaQuestionType";
import getTriviaQuestions from '../../../composables/triviaQuestions/getTriviaQuestions';
import "firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { projectFirestore } from "@/firebase/config";

const { t } = useI18n();
const isLoading = ref(true)
const snackbar = useSnackbarStore();

// 👉 Store
const selectedCategory = ref()
const selectedLevel = ref()
const selectedMedia = ref()

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
    title: 'Type',
    key: 'QuestionMediaType',
  },
  {
    title: 'Media',
    key: 'QuestionMediaUrl',
  },
  {
    title: 'Category',
    key: 'Category',
  },
  {
    title: 'Question',
    key: 'QuestionText',
  },
  {
    title: 'Level',
    key: 'Level',
  },
  {
    title: 'Points',
    key: 'Points',
  },
  {
    title: 'Last changed',
    key: 'ChangeDateTime',
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

const functions = getFunctions();

const listData = ref<TriviaQuestion[]>([]);
// Instantiate your composable
const getFunction = getTriviaQuestions();

onMounted(async () => {
  await getFunction.load();

  if (getFunction.error.value) {
    console.log('Error getting TriviaQuestions: ', getFunction.error.value);
  } else {
    listData.value = getFunction.triviaQuestions.value?.map((listData: any) => {
      return {
        ...listData,
        // Provide default values for required fields in case they don't exist in `listData`
        id: listData.id || '',
        QuestionText: listData.QuestionText || ''

      } as TriviaQuestion;
    }) || [];
  }
  isLoading.value = false;
});

const searchQuery = ref('') // this will track the value of the search input
const filteredListData = computed(() => {
  let filtered = listData.value;
  if (searchQuery.value || selectedCategory.value || selectedLevel.value || selectedMedia.value) {
    filtered = listData.value.filter(triviaQuestion =>
      (triviaQuestion.QuestionText.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        triviaQuestion.QuestionClarification.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
      (!selectedCategory.value || triviaQuestion.Category === selectedCategory.value) &&
      (!selectedLevel.value || triviaQuestion.Level === selectedLevel.value) &&
      (!selectedMedia.value || triviaQuestion.QuestionMediaType === selectedMedia.value)
    );
  }

  // Consider the pagination
  const startIndex = (page.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filtered.slice(startIndex, endIndex);
});

const totalListData = computed(() => listData.value.length);

interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

const navigateToFirebaseDB = (collection: string, docId: string) => {
  const url = `https://console.firebase.google.com/u/0/project/dev-trivia-9f984/firestore/databases/-default-/data/~2F${collection}~2F${docId}`;
  window.open(url, '_blank');
};

const formatTimestamp = (timestamp: FirebaseTimestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const trimString = (description: string, length: number) => {
  if (!description) return '';
  return description.length > length ? `${description.substring(0, length)}...` : description;
}

// 👉 Hover thumbnail
const hoverImage = ref('');
const showTooltip = ref(false);

const handleMouseOver = (imageUrl: string) => {
  hoverImage.value = imageUrl;
  showTooltip.value = true;
};

const handleMouseOut = () => {
  showTooltip.value = false;
};

// 👉 search filters
const categories = [
  {
    title: 'Sport',
    value: 'Sport',
  },
  {
    title: 'Geschiedenis',
    value: 'Geschiedenis',
  },
  {
    title: 'Geografie',
    value: 'Geografie',
  },
]

const levels = [
  {
    title: 'Beginner',
    value: 'Beginner',
  },
  {
    title: 'Intermediate',
    value: 'Intermediate',
  },
  {
    title: 'Advanced',
    value: 'Advanced',
  },
  
]

const media = [
  {
    title: 'Image',
    value: 'Image',
  },
  {
    title: 'Video',
    value: 'Video',
  },
  {
    title: 'YouTube',
    value: 'YouTube',
  },
]

const resolveMediaIcon = (mediaType:string) => {
  const mediaTypeLowerCase = mediaType.toLowerCase()
  if (mediaTypeLowerCase === 'image')
    return {
      color: 'warning',
      icon: 'tabler-photo',
    }
  if (mediaTypeLowerCase === 'video')
    return {
      color: 'error',
      icon: 'tabler-movie',
    }
  if (mediaTypeLowerCase === 'youtube')
    return {
      color: 'primary',
      icon: 'tabler-brand-youtube',
    }

  return {
    color: 'secondary',
    icon: 'tabler-photo',
  }
}

const deleteRowItem = async (id: string) => {
    const triviaQuestion = listData.value.find((question) => question.id === id);
    if (!triviaQuestion) {
      console.log("No id found.")
      snackbar.showSnackbar({
        color: "error",
        message: t("No record found with this id. Please contact support.")
      })
    } else {
      try {
        console.log("Trying to delete record.")
        // Delete document in Firestore
        const docRef = doc(projectFirestore, "TriviaQuestions_nl", id);
        await deleteDoc(docRef);
        console.log("Record delete in FB.")

        // Remove data from local state
        listData.value = listData.value.filter(question => question.id !== id);
        
        snackbar.showSnackbar({color: "success", message: t("Record successfully deleted.")});
      } catch (error) {
        console.log(error);
        snackbar.showSnackbar({color: "error", message: t("Failed to delete the record.")});
      }
  };
}

const router = useRouter();
const navigateToAdd = () => {
  router.push({ name: 'trivia-question-add' });
};

const navigateToEditLicense = (id: string) => {
  router.push({ path: '/triviaquestion/add', query: { id: id } });
};

</script>

<template>
  <section>
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
              v-model="selectedCategory"
              label="Select category"
              placeholder="Select category"
              :items="categories"
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
              v-model="selectedLevel"
              label="Select level"
              placeholder="Select level"
              :items="levels"
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
              v-model="selectedMedia"
              label="Select media"
              placeholder="Select media"
              :items="media"
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
            @click="navigateToAdd"
          >
            Add New Question
          </VBtn>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="filteredListData"
        :items-length="filteredListData.length"
        :headers="headers"
        class="text-no-wrap"
        @update:options="updateOptions"
        v-model:loading="isLoading"
      >

        <template #item.QuestionMediaUrl="{ item }">
          <div
            class="thumbnail-container"
            @mouseover="handleMouseOver(item.QuestionMediaUrl)"
            @mouseout="handleMouseOut"
          >
            <VImg
              class="thumbnail-padding"
              v-if="item.QuestionMediaUrl && item.QuestionMediaUrl.startsWith('https://')"
              :src="item.QuestionMediaUrl"
            />
            <!-- Tooltip that displays when hovered -->
            <div v-if="showTooltip && hoverImage === item.QuestionMediaUrl" class="tooltip">
              <VImg :src="hoverImage" />
            </div>
          </div>
        </template>

        <!-- 👉 QuestionMediaType -->
        <template #item.QuestionMediaType="{ item }">
          <div class="d-flex align-center gap-4">
            <VAvatar
              :size="30"
              :color="resolveMediaIcon(item.QuestionMediaType).color"
              variant="tonal"
            >
              <VIcon
                :size="20"
                :icon="resolveMediaIcon(item.QuestionMediaType).icon"
              />
            </VAvatar>
            <VTooltip
              location="top"
              activator="parent"
            >
              {{ item.QuestionMediaType }}
            </VTooltip>
          </div>
        </template>

        <!-- Description -->
        <template #item.QuestionText="{ item }">
          {{ trimString(item.QuestionText, 60) }}
        </template>

        <!-- CreatedAt -->
        <template #item.ChangeDateTime="{ item }">
          {{ formatTimestamp(item.ChangeDateTime) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            :disabled="item.deleteEmailTemplateLoading"
            v-if="!item.deleteEmailTemplateLoading"
            @click="deleteRowItem(item.id)">
            <VTooltip
              location="top"
              activator="parent"
            >
              Delete question
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
              Edit question
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
                <VListItem @click="navigateToFirebaseDB('TriviaQuestions_nl', item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-database-search" />
                  </template>
                  <VListItemTitle>Search Firebase</VListItemTitle>
                </VListItem>
                <VListItem link="">
                  <template #prepend>
                    <VIcon icon="tabler-message-language" />
                  </template>
                  <VListItemTitle>Translate question</VListItemTitle>
                </VListItem>
                <VListItem link="">
                  <template #prepend>
                    <VIcon icon="tabler-world-search" />
                  </template>
                  <VListItemTitle>Search media</VListItemTitle>
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
              {{ paginationMeta({page, itemsPerPage}, totalListData) }}
            </p>

            <VPagination
              v-model="page"
              :length="Math.ceil(totalListData / itemsPerPage)"
              :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalListData / itemsPerPage)"
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

<style>
.thumbnail-padding {
  padding: 30px;
}
.thumbnail-container {
  position: relative;
  cursor: pointer;
}

.thumbnail-padding {
  width: 100%; /* Adjust this as needed based on your layout */
  height: auto; /* Maintains the aspect ratio of the thumbnail */
}

.tooltip {
  position: absolute;
  top: 0; /* Align with the top of the thumbnail */
  left: 120%; /* Position directly to the right of the thumbnail */
  width: 400px; /* Specify the width of the tooltip */
  z-index: 100; /* Ensure it's on top of other elements */
  display: block; /* Display block to show the tooltip */
  background-color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3); /* Optional for better visibility */
  padding: 5px;
  border: 1px solid #ccc;
}

.tooltip VImg {
  width: 100%; /* Make sure the image fills the tooltip */
  height: auto; /* Keep the image aspect ratio */
}
</style>

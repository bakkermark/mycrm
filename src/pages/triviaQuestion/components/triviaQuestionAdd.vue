<template>
  <VCard title="Add Question">
    <VCardText class="pt-0">
      <VForm ref="refForm" @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12" md="12">
            <AppTextField
              v-model="formData.QuestionText"
              label="Question"
              placeholder="Type in the question ..."
              :rules="[requiredValidator]"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.CorrectAnswer"
              label="Correct answer"
              placeholder="Type in the correct answer."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.IncorrectAnswer1"
              label="Incorrect answer 1"
              placeholder="Type in the first incorrect answer."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.IncorrectAnswer2"
              label="Incorrect answer 2"
              placeholder="Type in the second incorrect answer."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.IncorrectAnswer3"
              label="Incorrect answer 3"
              placeholder="Type in the third incorrect answer."
              :rules="[requiredValidator]"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="24" md="12">
            <AppTextarea
              :rules="[requiredValidator]"
              v-model="formData.QuestionClarification"
              label="Clarification"
              placeholder="Type in the clarification for the correct answer."
              auto-grow
            />
          </VCol>
          <VCol cols="12" md="12">
            <AppSelect
              v-model="formData.Category"
              :items="triviaCategories"
              :rules="[requiredValidator]"
              placeholder="Select a category"
              label="Category"
              name="selectCategory"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.Level"
              :items="triviaLevels"
              :rules="[requiredValidator]"
              placeholder="Select a level"
              label="Level"
              name="selectLevel"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.Points"
              type="number"
              :rules="[requiredValidator, integerValidator]"
              label="Points"
              placeholder="5"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.AuthorLicense"
              :items="authorLicenses"
              :rules="[requiredValidator]"
              placeholder="Select a license"
              label="License"
              name="selectLicense"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.AuthorName"
              label="Author name"
              placeholder="Type in the author name."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField
              v-model="formData.AuthorSourceUrl"
              label="Author source url"
              placeholder="Type in the author source url."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.QuestionMediaType"
              :items="QuestionMediaTypes"
              :rules="[requiredValidator]"
              placeholder="Select a media type"
              label="Media type"
              name="selectMediaType"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="formData.QuestionMediaUrl"
              label="Media url"
              placeholder="Type in the media url."
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <VBtn type="submit" class="me-2" :disabled="submittingData">
              <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate/>
              Save
              <VTooltip open-delay="500" activator="parent" location="top">Save Trivia Question</VTooltip>
            </VBtn>
            <VBtn :disabled="submittingData" color="secondary" type="reset" variant="tonal">
              Reset
              <VTooltip open-delay="500" activator="parent" location="top">Reset the form</VTooltip>
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import { defineEmits, onMounted, ref, watchEffect, reactive } from 'vue';
import { collection, doc, getDoc } from 'firebase/firestore';
import { projectFirestore } from '@/firebase/config';
import AppTextField from '../../../@core/components/app-form-elements/AppTextField.vue';
import type { VForm } from 'vuetify/components';
import { useSnackbarStore } from '@/plugins/pinia/snackbarStore';
import { useI18n } from 'vue-i18n';
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import { useRoute, useRouter } from "vue-router";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { TriviaQuestion } from "@/types/triviaQuestionType";
import getQuestionMediaTypes from "@/composables/triviaQuestions/getQuestionMediaTypes";
import getAuthorLicenses from "@/composables/triviaQuestions/getAuthorLicenses";
import getTriviaCategories from "@/composables/triviaQuestions/getTriviaCategories";
import getTriviaLevels from "@/composables/triviaQuestions/getTriviaLevels";

const { QuestionMediaTypes, load: loadQuestionMediaTypes } = getQuestionMediaTypes();
const { authorLicenses, load: loadAuthorLicenses } = getAuthorLicenses();
const { triviaCategories, load: loadTriviaCategories } = getTriviaCategories();
const { triviaLevels, load: loadTriviaLevels } = getTriviaLevels();

const router = useRouter();
const isEditing = ref(false);
const { t } = useI18n();
const emit = defineEmits(['idUpdated']);
const firebaseCollectionName = 'TriviaQuestions_nl';
const refForm = ref<VForm | null>(null);
let submittingData = ref(false);
const route = useRoute();
const snackbarStore = useSnackbarStore();
const id = ref<string | null>(null);

onMounted(async () => {
  loadQuestionMediaTypes();
  loadAuthorLicenses();
  loadTriviaLevels();
  await loadTriviaCategories()
});

const formData = reactive({
  AuthorLicense: 'AI Generated',
  AuthorName: '',
  AuthorSourceUrl: '',
  Category: '',
  CorrectAnswer: '',
  IncorrectAnswer1: '',
  IncorrectAnswer2: '',
  IncorrectAnswer3: '',
  Level: 'Beginner',
  Points: 5,
  QuestionClarification: '',
  QuestionMediaType: '',
  QuestionMediaUrl: '',
  QuestionText: '',
  ChangeDateTime: new Date(),
});

const resetForm = () => {
  formData.AuthorLicense = 'AI Generated';
  formData.AuthorName = '';
  formData.AuthorSourceUrl = '';
  formData.Category = '';
  formData.CorrectAnswer = '';
  formData.IncorrectAnswer1 = '';
  formData.IncorrectAnswer2 = '';
  formData.IncorrectAnswer3 = '';
  formData.Level = 'Beginner';
  formData.Points = 5;
  formData.QuestionClarification = '';
  formData.QuestionMediaType = '';
  formData.QuestionMediaUrl = '';
  formData.QuestionText = '';
  formData.ChangeDateTime = new Date();
};

watchEffect(async () => {
  id.value = route.query.id as string | null;
  if (id.value == null) {
    isEditing.value = false;
    resetForm();
    emit('idUpdated', '');
    return;
  } else {
    isEditing.value = true;
    try {
      const docRef = doc(projectFirestore, firebaseCollectionName, String(id.value));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const apiData = docSnap.data() as TriviaQuestion;
        formData.AuthorLicense = apiData.AuthorLicense;
        formData.AuthorName = apiData.AuthorName;
        formData.AuthorSourceUrl = apiData.AuthorSourceUrl;
        formData.Category = apiData.Category;
        formData.CorrectAnswer = apiData.CorrectAnswer;
        formData.IncorrectAnswer1 = apiData.IncorrectAnswers[0];
        formData.IncorrectAnswer2 = apiData.IncorrectAnswers[1];
        formData.IncorrectAnswer3 = apiData.IncorrectAnswers[2];
        formData.Points = apiData.Points;
        formData.Level = apiData.Level;
        formData.QuestionClarification = apiData.QuestionClarification;
        formData.QuestionMediaType = apiData.QuestionMediaType;
        formData.QuestionMediaUrl = apiData.QuestionMediaUrl;
        formData.QuestionText = apiData.QuestionText;
        formData.ChangeDateTime = apiData.ChangeDateTime;

        emit('idUpdated', id);
      } else {
        snackbarStore.showSnackbar({ color: "error", message: t("Error fetching data. Please try again.") });
        return;
      }
    } catch (err) {
      snackbarStore.showSnackbar({ color: "error", message: t("Error fetching data. Please try again.") });
      return;
    }
  }
});

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (!validationResult.valid) {
      console.log("Form is invalid, stopping submission.");
      return;
    }

    submittingData.value = true;
    const question = {
      QuestionText: formData.QuestionText,
      CorrectAnswer: formData.CorrectAnswer,
      IncorrectAnswers: [formData.IncorrectAnswer1, formData.IncorrectAnswer2, formData.IncorrectAnswer3],
      QuestionClarification: formData.QuestionClarification,
      Level: formData.Level,
      Points: formData.Points,
      Category: formData.Category,
      AuthorLicense: formData.AuthorLicense,
      AuthorName: formData.AuthorName,
      AuthorSourceUrl: formData.AuthorSourceUrl,
      QuestionMediaType: formData.QuestionMediaType,
      QuestionMediaUrl: formData.QuestionMediaUrl,
      ChangeDateTime: serverTimestamp()
    };

    try {
      const collectionRef = collection(projectFirestore, 'TriviaQuestions_nl');
      if (isEditing.value) {
        const docRef = doc(projectFirestore, firebaseCollectionName, String(id.value));
        // Update the existing document when in edit mode
        await updateDoc(docRef, question);
      } else {
        // Add a new document when not in edit mode
        await addDoc(collectionRef, question);
      }
      await router.push({name: 'trivia-question-list'});
    } catch (error) {
      console.error("Error submitting form: ", error);
    } finally {
      submittingData.value = false;
    }
  }
};
</script>

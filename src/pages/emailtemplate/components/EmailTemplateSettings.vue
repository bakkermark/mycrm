<template>
  <VCard title="Emailtemplate">
    <VCardText class="pt-0">
      <VForm ref="refForm" @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.templateName" label="Name" placeholder="Type in name ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.templateGroup" label="Group" placeholder="Type in group ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="emailTemplateForm.description" label="Description" placeholder="Type in description ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="emailTemplateForm.subject" label="Subject" placeholder="Type in subject ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.fromEmail" label="From email" placeholder="Type in from email ... " :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.fromEmailName" label="From email name" placeholder="Type in from email name ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.replyEmail" label="Reply email" placeholder="Type in reply email ... " :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="emailTemplateForm.replyEmailName" label="Reply email name" placeholder="Type in reply email name ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="emailTemplateForm.templateType"
              :items="templateTypes"
              placeholder="Select a template type ..."
              label="Template type"
              name="selectTemplateType"
              require
            />
          </VCol>
          <VCol cols="12" md="12">
            <AppTextarea v-model="emailTemplateForm.htmlTemplate" label="Template" placeholder="Type in template HTML ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12">
            <VCol cols="12">
              <VBtn type="submit" class="me-2" :disabled="submittingData">
                <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate/>
                Save
                <VTooltip open-delay="500" activator="parent" location="top">Save the emailtemplate data</VTooltip>
              </VBtn>
              <VBtn :disabled="submittingData" color="secondary" type="reset" variant="tonal">
                Reset
                <VTooltip open-delay="500" activator="parent" location="top">Reset the form</VTooltip>
              </VBtn>
            </VCol>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import {defineEmits, ref, watchEffect} from 'vue';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore'
import {projectFirestore} from '@/firebase/config'
import AppTextField from '../../../@core/components/app-form-elements/AppTextField.vue'
import type {VForm} from 'vuetify/components'
import {useSnackbarStore} from '@/plugins/pinia/snackbarStore';
import {useI18n} from 'vue-i18n';
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import {useRoute} from "vue-router";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import {TriviaQuestion} from "@/types/emailTemplateType";
import {da} from "vuetify/locale";

const isEditing = ref(false);
const { t } = useI18n();
const emit = defineEmits(['emailTemplateUpdated']);
const firebaseCollectionName = 'EmailTemplates'
const refForm = ref<VForm | null>(null);
const templateTypes = ['HTML', 'Text']
const submittingData = ref(false)
const route = useRoute();
const snackbarStore = useSnackbarStore();
const emailtTemplateId = ref<string | null>(null);
const emailTemplateForm = reactive({
  createdAt: new Date(),
  createdBy: '',
  updatedAt: new Date(),
  updatedBy: '',
  description: '',
  templateGroup: '',
  templateName: '',
  subject: '',
  fromEmail: '',
  fromEmailName: '',
  replyEmail: '',
  replyEmailName: '',
  htmlTemplate: '',
  htmlThumbNail: '',
  licenseCode: '',
  templateType: ''
});

const resetForm = () => {
  emailTemplateForm.createdAt = new Date();
  emailTemplateForm.createdBy = '';
  emailTemplateForm.updatedAt = new Date();
  emailTemplateForm.updatedBy = '';
  emailTemplateForm.description = '';
  emailTemplateForm.templateGroup = '';
  emailTemplateForm.templateName = '';
  emailTemplateForm.subject = '';
  emailTemplateForm.fromEmail = '';
  emailTemplateForm.fromEmailName = '';
  emailTemplateForm.replyEmail = '';
  emailTemplateForm.replyEmailName = '';
  emailTemplateForm.htmlTemplate = '';
  emailTemplateForm.htmlThumbNail = '';
  emailTemplateForm.licenseCode = '';
  emailTemplateForm.templateType = '';
}

watchEffect(async () => {
  // Check if there is a query parameter id in the url.
  emailtTemplateId.value = route.query.id as string | null;
  if (emailtTemplateId.value == null) {
    isEditing.value = false;
    resetForm()
    emit('emailTemplateUpdated', '');
    return;
  } else {
    isEditing.value = true;
    try {
      const emailTemplateDocRef = doc(projectFirestore, firebaseCollectionName, String(emailtTemplateId.value));
      console.log("Emailtemplate data wordt opgehaald ... ")
      const emailTemplateDocSnap = await getDoc(emailTemplateDocRef);
      console.log("Emailtemplate data opgehaald.")
      if (emailTemplateDocSnap.exists()) {
        const emailTemplateData = emailTemplateDocSnap.data() as TriviaQuestion;
        emailTemplateForm.createdAt = emailTemplateData.createdAt;
        emailTemplateForm.createdBy = emailTemplateData.createdBy;
        emailTemplateForm.updatedAt = emailTemplateData.updatedAt;
        emailTemplateForm.updatedBy = emailTemplateData.updatedBy;
        emailTemplateForm.description = emailTemplateData.description;
        emailTemplateForm.templateGroup = emailTemplateData.templateGroup;
        emailTemplateForm.templateName = emailTemplateData.templateName;
        emailTemplateForm.subject = emailTemplateData.subject;
        emailTemplateForm.fromEmail = emailTemplateData.fromEmail;
        emailTemplateForm.fromEmailName = emailTemplateData.fromEmailName;
        emailTemplateForm.replyEmail = emailTemplateData.replyEmail;
        emailTemplateForm.replyEmailName = emailTemplateData.replyEmail;
        emailTemplateForm.htmlTemplate = emailTemplateData.htmlTemplate;
        emailTemplateForm.htmlThumbNail = emailTemplateData.htmlThumbnail;
        emailTemplateForm.licenseCode = emailTemplateData.licenseCode;
        emailTemplateForm.templateType = emailTemplateData.templateType;

        // Update the license id so other tabs come available in user/index.vue
        emit('emailTemplateUpdated', emailtTemplateId);
      } else {
        snackbarStore.showSnackbar({color: "error", message: t("Error fetching data. Please try again.")})
        return
      }
    } catch (err) {
      snackbarStore.showSnackbar({color: "error", message: t("Error fetching data. Please try again.")})
      return
    }
  }
});

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      submittingData.value = true;
      try {
        const EmailTemplate = {
          createdAt: new Date(),
          createdBy: 'Mark Bakker',
          updatedAt: new Date(),
          updatedBy: 'Mark Bakker',
          description: emailTemplateForm.description,
          templateGroup: emailTemplateForm.templateGroup,
          templateName: emailTemplateForm.templateName,
          subject: emailTemplateForm.subject,
          fromEmail: emailTemplateForm.fromEmail,
          fromEmailName: emailTemplateForm.fromEmailName,
          replyEmail: emailTemplateForm.replyEmail,
          replyEmailName: emailTemplateForm.replyEmailName,
          htmlTemplate: emailTemplateForm.htmlTemplate,
          htmlThumbNail: emailTemplateForm.htmlThumbNail,
          licenseCode: emailTemplateForm.licenseCode,
          templateType: emailTemplateForm.templateType
        };
        try {
          const emailTemplatesCollection = collection(projectFirestore, firebaseCollectionName);
          console.log("EmailTemplateId before add: " + emailtTemplateId.value)
          console.log("Check value isEditing: " + isEditing.toString())
          if (!isEditing.value) {
            const emailTemplateDoc = doc(emailTemplatesCollection);
            await setDoc(emailTemplateDoc, EmailTemplate);
            //emailTemplateId.value = emailTemplateDoc.id;
            emit('emailTemplateUpdated', emailtTemplateId);
            console.log("EmailTemplateId after add: " + emailtTemplateId.value)
            snackbarStore.showSnackbar({color: "success", message: t("Emailtemplate has been added successfully.")});
          } else {
            const licenseDoc = doc(emailTemplatesCollection, emailtTemplateId.value!);
            await setDoc(licenseDoc, EmailTemplate, {merge: true});
            snackbarStore.showSnackbar({color: "success", message: t("Emailtemplate has been updated successfully.")});
          }
        } catch (err) {
          snackbarStore.showSnackbar({color: "error", message: t("License could not be added. Details: " + err)});
        } finally {
          submittingData.value = false;
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>

<script setup lang="ts">
import type {VForm} from "vuetify/components";
import {ref as ref, onMounted, defineEmits} from 'vue';
import {doc, setDoc, getDoc} from 'firebase/firestore';
import {ref as fbRef, getDownloadURL, uploadBytes} from '@firebase/storage';
import {projectFirestore, projectStorage} from '@/firebase/config';
import getLicenses from "@/composables/getLicenses";
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import { v4 as uuidv4 } from 'uuid';
import 'firebase/functions';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {em} from "@fullcalendar/core/internal-common";

const emit = defineEmits(['userUpdated']);
const {t} = useI18n();
const avatarImage = ref('')
const {licenses, load} = getLicenses();
const refForm = ref<VForm | null>(null);
const firstName = ref('')
const infix = ref('')
const lastName = ref('')
const email = ref('')
const selectedLicenseHolder = ref('')
const roles = ['Admin', 'Standard User']
const selectedRole = ref('')
const licenseHolders = ref<string[]>([]);
const password = ref(uuidv4());

const refInputEl = ref()

const changeAvatar = (file: Event) => {
  const fileReader = new FileReader()
  const files = (file.target as HTMLInputElement).files
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        avatarImage.value = fileReader.result
    }
  }
}

const resetAvatar = () => {
  avatarImage.value = ''
}



onMounted(async () => {
  await load();
  licenseHolders.value = licenses.value.map(license => `${license.company} (${license.id})`);
});

const submittingData = ref(false)
const snackbarStore = useSnackbarStore();

interface cloudFunctionResponse {
  success: boolean;
  message: string;
  returnValue: string;
}

interface License {
  plan: string;
}

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      try {
        // Try to add user to Firebase Auth
        submittingData.value = true;
        const functions = getFunctions();
        const addUser = httpsCallable(functions, 'addUser');
        const result = await addUser({email: email.value, password: password.value});
        const response = result.data as cloudFunctionResponse;
        if (!response.success) {
          snackbarStore.showSnackbar({color: "error", message: t(response.message)})
          return
        }
        
        // If user is added to Firebase Auth
        const uid = response.returnValue;
        const companyIdSplit = selectedLicenseHolder.value.split(' (');
        const companyName = companyIdSplit[0];
        const licenseId = companyIdSplit[1].replace(')', '');
        const docRef = doc(projectFirestore, "Licenses", licenseId);
        const docSnap = await getDoc(docRef);
        let selectedPlan = '';
        if (docSnap.exists()) {
          const data = docSnap.data() as License;
          selectedPlan = data.plan;
        } else {
          console.error("No such document with id " + licenseId);
        }
        
        // Add avatar of user Firebase Storage
        const file = refInputEl.value?.files[0];
        let avatar = ''
        if (file) {
          const fileRef = fbRef(projectStorage, 'Avatars/' + uid + '.' + file.name.split('.').pop());
          const snapshot = await uploadBytes(fileRef, file);
          avatar = await getDownloadURL(snapshot.ref);
        }
        
        // Add user to FireStore collection Users
        const User = {
          id: uid,
          firstName: firstName.value,
          infix: infix.value,
          lastName: lastName.value,
          fullName: [firstName.value, infix.value, lastName.value].filter(Boolean).join(" "),
          email: email.value,
          status: "Active",
          role: selectedRole.value,
          company: companyName,
          licenseCode: licenseId,
          plan: selectedPlan,
          avatar: avatar,
          createdAt: new Date()
        }
        await setDoc(doc(projectFirestore, "Users", uid), User);
        emit('userUpdated', uid); // Emit an event with the uid
        snackbarStore.showSnackbar({color: "success", message: t("User has been added successfully.")})
      } catch (err) {
        snackbarStore.showSnackbar({color: "error", message: t("User could not be added. Details: " + err)})
        console.error("Error: " + err);
      } finally {
        // Create a reference to the 'sendEmail' Cloud Function
        const functions = getFunctions(); // Get a reference to the Cloud Functions instance.
        const sendEmail = httpsCallable(functions, 'sendEmailTemplate');

        // Define the custom fields data
        const variablesData = [
          {
            email: email.value,
            substitutions: [
              {
                var: 'firstName',
                value: firstName.value
              },
              {
                var: 'action_url',
                value: 'https://dev-mycrm.web.app/login'
              }
            ],
          }
        ];
        
        // Define the email data
        const emailData = {
          toEmail: email.value,
          fromEmail: 'info@multimediamarkers.com',
          subject: 'Activeer je myCRM account',
          templateId: 'jy7zpl9jr2pg5vx6',
          variables: variablesData
        };

        // Call the function and handle the response
        try {
          const result = await sendEmail(emailData);
          snackbarStore.showSnackbar({color: "success", message: t("Email sent to user.")})
        } catch (error) {
          snackbarStore.showSnackbar({color: "success", message: t("Email could not be sent to user. Details: " + error)})
        }
        submittingData.value = false;
      }
    }
  }
};
</script>

<template>
  <VCard title="User">
    <VCardText class="pt-0">
      <VForm ref="refForm" @submit.prevent="handleSubmit">
        <VRow>
          <!-- 👉 Upload Photo -->
          <VCol cols="1" md="1">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded
              size="100"
              class="me-6"
              :image="avatarImage"
            />
          </VCol>
          <VCol cols="12" md="11">
            <form class="d-flex flex-column justify-center gap-4">
              <div class="d-flex flex-wrap gap-2">
                <VBtn color="primary" @click="refInputEl?.click()">
                  <VIcon icon="tabler-cloud-upload" class="d-sm-none"/>
                  <span class="d-none d-sm-block">Upload photo</span>
                </VBtn>
                <input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg,GIF" hidden
                       @input="changeAvatar">
                <VBtn type="reset" color="secondary" variant="tonal" @click="resetAvatar">
                  <span class="d-none d-sm-block">Reset</span>
                  <VIcon icon="tabler-refresh" class="d-sm-none"/>
                </VBtn>
              </div>
              <p class="text-body-1 mb-0">
                Allowed JPG, GIF or PNG. Max size of 800K
              </p>
            </form>
          </VCol>
          <VCol cols="12" md="4">
            <AppTextField v-model="firstName" label="First Name" placeholder="Type in first name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="2">
            <AppTextField v-model="infix" label="Infix" placeholder="Type in infix ... "/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="lastName" label="Last Name" placeholder="Type in last name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="email" label="Email" placeholder="Type in email address ..."
                          :rules="[requiredValidator, emailValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect v-model="selectedLicenseHolder" :items="licenseHolders" :rules="[requiredValidator]"
                       placeholder="Select a license holder ..." label="License holder" name="selectLicenseHolder"
                       require/>

          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="selectedRole"
              :items="roles"
              :rules="[requiredValidator]"
              placeholder="Select a role ..."
              label="Role"
              name="selectRole"
              require
            />
          </VCol>

          <VCol cols="12">
            <VBtn type="submit" class="me-2" :disabled="submittingData">
              <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate/>
              Save
              <VTooltip open-delay="500" activator="parent" location="top">Save the user data</VTooltip>
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

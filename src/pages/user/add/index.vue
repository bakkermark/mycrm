<template>
  <VCard title="Add user">
    <VCardText class="d-flex">
      <VForm ref="refForm" @submit.prevent="handleSubmit">
        <VRow>
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
            <AppTextField
              v-model="password"
              :append-inner-icon="show1 ? 'tabler-eye-off' : 'tabler-eye' "
              :rules="[rules.required, rules.min]"
              :type="show1 ? 'text' : 'password'"
              name="password"
              label="Password"
              hint="At least 8 characters"
              placeholder="············"
              counter
              @click:append-inner="show1 = !show1"
            />
          </VCol>
          <VCol
            cols="12"
            sm="6"
          >
            <AppTextField
              v-model="confirmPassword"
              :rules="[rules.required, rules.min]"
              :append-inner-icon="show2 ? 'tabler-eye-off' : 'tabler-eye' "
              :type="show2 ? 'text' : 'password'"
              name="ConfirmPassword"
              placeholder="············"
              label="Confirm password"
              hint="At least 8 characters"
              @click:append-inner="show2 = !show2"
            />
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
          <VCol cols="1" md="1">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded
              size="100"
              class="me-6"
              :image="avatarImage"
            />
          </VCol>
          <VCol cols="5" md="5">
            <!-- 👉 Upload Photo -->
            <form class="d-flex flex-column justify-center gap-4">
              <div class="d-flex flex-wrap gap-2">
                <VBtn color="primary" @click="refInputEl?.click()">
                  <VIcon icon="tabler-cloud-upload" class="d-sm-none"/>
                  <span class="d-none d-sm-block">Upload photo</span>
                </VBtn>
                <input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg,GIF" hidden @input="changeAvatar">
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
          <VCol cols="12">
            <VBtn type="submit" class="me-2" :disabled="submittingData">
              <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate />
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

<script lang="ts" setup>
import { ref as ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { doc, setDoc } from 'firebase/firestore';
import { ref as fbRef, getDownloadURL, uploadBytes } from '@firebase/storage';
import { auth, projectFirestore, projectStorage } from '@/firebase/config';
import * as firebase from 'firebase/app';
import 'firebase/functions';
import type { VForm } from 'vuetify/components';
import getLicenses from "@/composables/getLicenses";
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from "@/plugins/pinia/snackbarStore";
import { getAuth } from "firebase/auth";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";

const {t} = useI18n();
const avatarImage = ref('')
const {licenses, load} = getLicenses();
const routePushName = 'user-list'
const firebaseCollectionName = 'Users'
const router = useRouter();
const refForm = ref<VForm | null>(null);
const firstName = ref('')
const infix = ref('')
const lastName = ref('')
const email = ref('')
const selectedLicenseHolder = ref('')
const roles = ['Admin', 'Standard User']
const selectedRole = ref('')
const licenseHolders = ref<string[]>([]);
const selectedPlan = ref('Basic')
const show1 = ref(false)
const show2 = ref(true)
const password = ref('')
const confirmPassword = ref('')
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

const rules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || 'Min 8 characters',
}

onMounted(async () => {
  await load();
  licenseHolders.value = licenses.value.map(license => `${license.company} (${license.id})`);

  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (currentUser) {
    console.log("Current logged-in user before submit: ", currentUser.email);
  }
});

const submittingData = ref(false)
const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      try {
        submittingData.value = true;

        const addUserFunc = firebase.functions().httpsCallable('addUser');
        const result = await addUserFunc({ email: email.value, password: password.value });

        if (!result.data.success) {
          throw new Error(result.data.message);
        }

        const uid = result.data.returnValue;
        const companyIdSplit = selectedLicenseHolder.value.split(' (');
        const companyName = companyIdSplit[0];
        const licenseId = companyIdSplit[1].replace(')', '');
        const file = refInputEl.value?.files[0];
        const fileRef = fbRef(projectStorage, 'Avatars/' + uid + '.' + file.name.split('.').pop());
        const snapshot = await uploadBytes(fileRef, file);
        const avatar = await getDownloadURL(snapshot.ref);

        const data = {
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
          plan: selectedPlan.value,
          avatar: avatar,
          createdAt: new Date()
        }

        await setDoc(doc(projectFirestore, firebaseCollectionName, uid), data);

        const authInstance = getAuth();
        const currentUser = authInstance.currentUser;
        if (currentUser) {
          console.log("Current logged-in user after submit: ", currentUser.email);
        }

        const snackbarStore = useSnackbarStore();
        const snackBarPayload = { color: "success", message: t("User has been added successfully.") }
        snackbarStore.showSnackbar(snackBarPayload)
        await router.push({ name: routePushName });

      } catch (err) {
        const snackbarStore = useSnackbarStore();
        const snackBarPayload = { color: "error", message: t("User could not be added. Details: " + err) }
        snackbarStore.showSnackbar(snackBarPayload)
        console.error(err);
      } finally {
        submittingData.value = false;
      }
    }
  }
};
</script>

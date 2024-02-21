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
            <VBtn
              type="submit"
              class="me-2"
            >
              Save
              <VTooltip
                open-delay="500"
                activator="parent"
                location="top"
              >
                Save the user data
              </VTooltip>
            </VBtn>

            <VBtn
              color="secondary"
              type="reset"
              variant="tonal"
            >
              Reset
              <VTooltip
                open-delay="500"
                activator="parent"
                location="top"
              >
                Reset the form
              </VTooltip>
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import {ref as vueRef, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {doc, setDoc} from 'firebase/firestore';
import {ref as fbRef, getDownloadURL, uploadBytes} from '@firebase/storage';
import {auth, projectFirestore, projectStorage} from '@/firebase/config';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import AppTextField from "@core/components/app-form-elements/AppTextField.vue";
import type {VForm} from 'vuetify/components';
import getLicenses from "@/composables/getLicenses";
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";

const {t} = useI18n();
const avatarImage = vueRef('/Avatars/14.png')
const {licenses, load} = getLicenses();
const routePushName = 'user-list'
const firebaseCollectionName = 'Users'
const router = useRouter();
const refForm = vueRef<VForm | null>(null);
const firstName = vueRef('')
const infix = vueRef('')
const lastName = vueRef('')
const email = vueRef('')
const selectedLicenseHolder = vueRef('')
const roles = ['Admin', 'Standard User']
const selectedRole = vueRef('')
const licenseHolders = vueRef<string[]>([]);
const selectedPlan = vueRef('Basic')
const show1 = vueRef(false)
const show2 = vueRef(true)
const password = vueRef('')
const confirmPassword = vueRef('')
const refInputEl = vueRef()

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
});

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const uid = credential.user.uid;
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
        const snackbarStore = useSnackbarStore();
        const snackBarPayload = {color: "success", message: t("User has been added successfully.")}
        snackbarStore.showSnackbar(snackBarPayload)
        await router.push({name: routePushName});
      } catch (err) {
        const snackbarStore = useSnackbarStore();
        const snackBarPayload = {color: "error", message: t("User could not be added. Details: " + err)}
        snackbarStore.showSnackbar(snackBarPayload)
        console.error(err);
      }
    }
  }
};
</script>

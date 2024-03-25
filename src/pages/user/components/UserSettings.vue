<script setup lang="ts">
import type {VForm} from "vuetify/components";
import {ref as ref, onMounted, defineEmits} from 'vue';
import {doc, setDoc, getDoc} from 'firebase/firestore';
import {ref as fbRef, getDownloadURL, uploadBytes, deleteObject, getStorage} from '@firebase/storage';
import {functions, projectFirestore, projectStorage} from '@/firebase/config';
import getLicenses from "../../../composables/license/getLicenses";
import {useI18n} from 'vue-i18n';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import { v4 as uuidv4 } from 'uuid';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {License} from "@/types/licenseType";
import {ApiResponse} from "@/types/apiResponseType";
import { collection } from "firebase/firestore";
import {useRoute} from "vue-router";
import {User} from "@/pages/user/userTypes";

const isEditing = ref(false);
const emit = defineEmits(['userUpdated']);
const {t} = useI18n();
const {licenses, load} = getLicenses();
const refForm = ref<VForm | null>(null);
const roles = ['Admin', 'Standard User']
const licenseHolders = ref<string[]>([]);
const password = ref(uuidv4());
const route = useRoute();
const userId = ref<string | null>(null);
const user = ref<User | null>(null);
const refInputEl = ref()
const submittingData = ref(false)
const snackbarStore = useSnackbarStore();
const userForm = reactive({
  firstName: '',
  infix: '',
  lastName: '',
  email: '',
  selectedLicenseHolder: '',
  selectedRole: '',
  avatar: ''
});
let oldAvatarUrl = '';
let oldEmail = '';

onMounted(async () => {
  await load(); // getLicenses
  licenseHolders.value = licenses.value.map(license => `${license.company} (${license.id})`);
  
  // Check if there is a query parameter id in the url.
  userId.value = route.query.id as string | null;
  if (userId.value == null) {
    isEditing.value = false;
    return;
  } else {
    isEditing.value = true;
    
    try {
      const userDocRef = doc(projectFirestore, 'Users', String(userId.value));
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        userForm.firstName = userData.firstName;
        userForm.lastName = userData.lastName;
        userForm.email = userData.email;
        oldEmail = userData.email;
        userForm.selectedRole = userData.role;
        userForm.selectedLicenseHolder = userData.company + " (" + userData.licenseCode + ")";
        if (userData.avatar != null) {
          userForm.avatar = userData.avatar;
          oldAvatarUrl = userData.avatar;
        }
        // Update the user id so other tabs come available in user/index.vue
        emit('userUpdated', userId);
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

// Change the avatar image file.
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader()
  const files = (file.target as HTMLInputElement).files
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        userForm.avatar = fileReader.result
    }
  }
}

const resetAvatar = () => {
  userForm.avatar = ''
}

const resetForm = () => {
  userForm.lastName = '';
  userForm.avatar = '';
  userForm.email = '';
  userForm.selectedRole = '';
  userForm.selectedLicenseHolder = '';
  userForm.firstName = '';
  userForm.infix = ''
}

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      submittingData.value = true;
      let response: ApiResponse;
      // If a new user is being added
      if (!isEditing.value) {
        try {
          // Try to add user to Firebase Auth
          const functions = getFunctions();
          const addUser = httpsCallable(functions, 'addUser');
          const result = await addUser({email: userForm.email, password: password.value});
          response = result.data as ApiResponse;
          // If an error occured inform user and stop.
          if (!response.success) {
            snackbarStore.showSnackbar({color: "error", message: t(response.message)})
            return
          }
        } catch (err) {
          snackbarStore.showSnackbar({color: "error", message: t("User could not be added. Details: " + err)})
        }
      }
      
      // Determine where the uid came from
      let uid: string | undefined;
      if (!isEditing.value) {
        uid = response.returnValue;
      }
      else {
        uid = String(userId.value);
      }
        
      // Determine company, licenseId and plan.
      const companyIdSplit = userForm.selectedLicenseHolder.split(' (');
      const companyName = companyIdSplit[0];
      const licenseId = companyIdSplit[1].replace(')', '');
      const licensesCollection = collection(projectFirestore, "Licenses");
      const docRef = doc(licensesCollection, licenseId);
      const docSnap = await getDoc(docRef);
      let selectedPlan = '';
      if (docSnap.exists()) {
        const data = docSnap.data() as License;
        selectedPlan = data.plan;
      }
      
      // Add or update avatar of user Firebase Storage
      const file = refInputEl.value?.files[0];
      let avatar = ''
      if (file) {
        if (oldAvatarUrl) {
          // Delete the old avatar file on Firebase storage
          const storage = getStorage();
          const url = new URL(oldAvatarUrl);
          const partialPath = url.pathname;
          const filename = decodeURIComponent(partialPath.substring(partialPath.lastIndexOf('/') + 1));
          const oldAvatarRef = fbRef(storage, filename);
          deleteObject(oldAvatarRef).then(() => {
            
          }).catch((error) => {
            //TODO Write to log
            console.error(`Failed to remove file ${oldAvatarUrl}:`, error);
          });
        }
        
        // Now add a new avatar file to Firebase storage.
        const fileRef = fbRef(projectStorage, 'Avatars/' + uid + '.' + file.name.split('.').pop());
        const snapshot = await uploadBytes(fileRef, file);
        avatar = await getDownloadURL(snapshot.ref);
      } else {
        if (oldAvatarUrl != userForm.avatar) {
          // Delete the old avatar file from Firebase storage.
          const storage = getStorage();
          const url = new URL(oldAvatarUrl);
          const partialPath = url.pathname;
          const filename = decodeURIComponent(partialPath.substring(partialPath.lastIndexOf('/') + 1));
          const oldAvatarRef = fbRef(storage, filename);
          deleteObject(oldAvatarRef).then(() => {
          }).catch((error) => {
            //TODO Write to log
            console.error(`Failed to remove file ${oldAvatarUrl}:`, error);
          });
        }
        else {
          avatar = oldAvatarUrl;
        }
      }
      
      // Add or update user to FireStore collection Users
      const User = {
        id: uid,
        firstName: userForm.firstName,
        infix: userForm.infix,
        lastName: userForm.lastName,
        fullName: [userForm.firstName, userForm.infix, userForm.lastName].filter(Boolean).join(" "),
        email: userForm.email,
        status: "Active",
        role: userForm.selectedRole,
        company: companyName,
        licenseCode: licenseId,
        plan: selectedPlan,
        avatar: avatar,
        createdAt: new Date()
      }
      
      try {
        // Update also Firebase Auth user email if email has changed.
        if (oldEmail != userForm.email) {
          const updateUserEmail = httpsCallable(functions, 'updateUserEmail');
          const result = await updateUserEmail({uid: uid, email: userForm.email});
          //TODO Do someting with the result?
          response = result.data as ApiResponse;
        }
        const usersCollection = collection(projectFirestore, "Users");
        const userDoc = doc(usersCollection, uid!);
        if (!isEditing.value) {
          await setDoc(userDoc, User);
          emit('userUpdated', uid);
          snackbarStore.showSnackbar({color: "success", message: t("User has been added successfully.")});
        } else {
          await setDoc(userDoc, User, { merge: true });
          snackbarStore.showSnackbar({color: "success", message: t("User has been updated successfully.")});
        }
      } catch (err) {
        snackbarStore.showSnackbar({color: "error", message: t("User could not be added. Details: " + err)});
      } finally {
        submittingData.value = false;
      }
    }
  }
};
</script>

<template>
  <VCard :title="isEditing ? 'Edit user' : 'Add user'">
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
              :image="userForm.avatar"
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
            <AppTextField v-model="userForm.firstName" label="First Name" placeholder="Type in first name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="2">
            <AppTextField v-model="userForm.infix" label="Infix" placeholder="Type in infix ... "/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="userForm.lastName" label="Last Name" placeholder="Type in last name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="userForm.email" label="Email" placeholder="Type in email address ..."
                          :rules="[requiredValidator, emailValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect v-model="userForm.selectedLicenseHolder" :items="licenseHolders" :rules="[requiredValidator]"
                       placeholder="Select a license holder ..." label="License holder" name="selectLicenseHolder"
                       require/>

          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="userForm.selectedRole"
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
            <VBtn :disabled="submittingData" @click="resetForm" color="secondary" type="reset" variant="tonal">
              Reset
              <VTooltip open-delay="500" activator="parent" location="top">Reset the form</VTooltip>
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

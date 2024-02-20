<template>
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
                   placeholder="Select a license holder ..." label="License holder" name="selectLicenseHolder" require/>
        
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
</template>

<script lang="ts" setup>
import {onMounted, ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {doc, setDoc} from 'firebase/firestore';
import {auth, projectFirestore} from '@/firebase/config';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import AppTextField from "@core/components/app-form-elements/AppTextField.vue"
import type {VForm} from 'vuetify/components';
import getLicenses from "@/composables/getLicenses";

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
        // create a new user with Firebase Auth
        const credential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const uid = credential.user.uid;
        const companyIdSplit = selectedLicenseHolder.value.split(' (');
        const companyName = companyIdSplit[0]; // get the company part
        const licenseId = companyIdSplit[1].replace(')', ''); // extract id from the string
        
        // use the uid as the id for the new Firestore document
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
          createdAt: new Date()
        }
        await setDoc(doc(projectFirestore, firebaseCollectionName, uid), data);

        // navigate to user list
        await router.push({name: routePushName});
      } catch (err) {
        console.error(err);
      }

    }
  }
};
</script>

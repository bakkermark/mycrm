<template>
  <VForm ref="refForm" @submit.prevent="handleSubmit">
    <VRow>
      <VCol cols="12" md="4">
        <AppTextField v-model="firstName" label="First Name" placeholder="Type in first name ..." :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="2">
        <AppTextField v-model="infix" label="Infix" placeholder="Type in infix ... "/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="lastName" label="Last Name" placeholder="Type in last name ..."
                      :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="email" label="Email" placeholder="Type in email address ..." :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="company" label="Company name" placeholder="Type in company name ..."
                      :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12">
        <VBtn
          type="submit"
          class="me-2"
        >
          Save
        </VBtn>

        <VBtn
          color="secondary"
          type="reset"
          variant="tonal"
        >
          Reset
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import { addDoc, collection } from 'firebase/firestore'
import { projectFirestore } from '@/firebase/config';
import AppTextField from "@core/components/app-form-elements/AppTextField.vue"
import type {VForm} from 'vuetify/components';

const routePushName = 'license-list'
const firebaseCollectionName = 'Licenses'

const router = useRouter();
const refForm = ref<VForm | null>(null);
const firstName = ref('')
const infix = ref('')
const lastName = ref('')
const email = ref('')
const company = ref('')

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      const data = {
        Company: company.value,
        FirstName: firstName.value,
        Infix: infix.value,
        LastName: lastName.value,
        Email: email.value,
      }

      await addDoc(collection(projectFirestore, firebaseCollectionName), data)
      await router.push({ name: routePushName })
    } else {
    }
  }
};
</script>

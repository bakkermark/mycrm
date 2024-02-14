<template>
  <VForm ref="refForm" @submit.prevent="handleSubmit">
    <VRow>
      <VCol cols="12" md="4">
        <AppTextField v-model="firstName" label="First Name" placeholder="John" :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="2">
        <AppTextField v-model="infix" label="Infix" placeholder="Type in infix ... "/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="lastName" label="Last Name" placeholder="Type in last name ..."
                      :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="email" label="Email" placeholder="john@email.com" :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12" md="6">
        <AppTextField v-model="company" label="Company name" placeholder="Type in company name ..."
                      :rules="[requiredValidator]"/>
      </VCol>
      <VCol cols="12">
        <VBtn type="submit">Submit</VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import type {VForm} from 'vuetify/components';

const router = useRouter();
const refForm = ref<VForm | null>(null);

const firstName = ref('');
const infix = ref('');
const lastName = ref('');
const email = ref('');
const company = ref('');
const handleSubmit = async () => {
  // Check if refForm.value exists to prevent TypeScript errors
  if (refForm.value) {
    // Await the Promise resolved by the validate method
    const validationResult = await refForm.value.validate();
    // validationResult.valid will be true if the form is valid, false otherwise
    if (validationResult.valid) {
      console.log('Form is valid, proceeding with submission:', {
        firstName: firstName.value,

      });
      // Proceed with your form submission logic...
    } else {
      console.log('Form validation failed, not submitting.');
    }
  }
};
</script>

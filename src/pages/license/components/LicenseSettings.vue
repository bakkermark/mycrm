<template>
  <VCard title="License">
    <VCardText class="pt-0">
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
            <AppTextField v-model="email" label="Email" placeholder="Type in email address ..." :rules="[requiredValidator, emailValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="company" label="Company name" placeholder="Type in company name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="4">
            <AppTextField v-model="address" label="Address" placeholder="Type in address ..."/>
          </VCol>
          <VCol cols="12" md="2">
            <AppTextField v-model="postalCode" label="Postalcode" placeholder="Type in postalcode ... "/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="state" label="State" placeholder="Type in state ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="city" label="City" placeholder="Type in city ..." />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="selectedCountry"
              :items="countries"
              placeholder="Select a country ..."
              label="Country"
              name="selectCountry"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="website" label="Website" placeholder="Type in website ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="copyright" label="Copyright text" placeholder="Type in copyright text ..."/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="emailSignature" label="Email signature" placeholder="Type in email signature ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="selectedPlan"
              :items="plans"
              :rules="[requiredValidator]"
              placeholder="Select a plan ..."
              label="Plan"
              name="selectPlan"
              require
            />
          </VCol>
          <VCol cols="12">
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
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
import {defineEmits, ref} from 'vue';
import {addDoc, collection} from 'firebase/firestore'
import {projectFirestore} from '@/firebase/config'
import AppTextField from '../../../@core/components/app-form-elements/AppTextField.vue'
import type {VForm} from 'vuetify/components'
import {useSnackbarStore} from '@/plugins/pinia/snackbarStore';
import { useI18n } from 'vue-i18n';
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";

const { t } = useI18n();
const emit = defineEmits(['licenseUpdated']);
const firebaseCollectionName = 'Licenses'
const snackbar = useSnackbarStore();
const refForm = ref<VForm | null>(null);
const firstName = ref('')
const infix = ref('')
const lastName = ref('')
const email = ref('')
const company = ref('')
const plans = ['Basic', 'Extended', 'Platinum']
const selectedPlan = ref('')
const address = ref('')
const postalCode = ref('')
const city = ref('')
const state = ref('')
const countries = ['Netherlands', 'Germany', 'Belgium']
const selectedCountry = ref('')
const website = ref('')
const copyright = ref('')
const emailSignature = ref('')
const submittingData = ref(false)

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      submittingData.value = true;
      try {
        const data = {
          company: company.value,
          firstName: firstName.value,
          infix: infix.value,
          lastName: lastName.value,
          fullName: [firstName.value, infix.value, lastName.value].filter(Boolean).join(" "),
          email: email.value,
          plan: selectedPlan.value,
          address: address.value,
          postalCode: postalCode.value,
          city: city.value,
          state: state.value,
          country: selectedCountry.value,
          website: website.value,
          copyright: copyright.value,
          emailSignature: emailSignature.value
        }
        const docRef = await addDoc(collection(projectFirestore, firebaseCollectionName), data)
        const snackBarPayload = { color: "success", message: t("License has been added succesfully.") }
        snackbar.showSnackbar(snackBarPayload)
        const Id = docRef.id;
        emit('licenseUpdated', Id);
      } catch(err) {
        const snackBarPayload = { color: "error", message: t("License could not be added. Details: " + err) }
        snackbar.showSnackbar(snackBarPayload)
      }
      submittingData.value = false;
    }
  }
};
</script>

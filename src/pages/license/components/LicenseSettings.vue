<template>
  <VCard title="License">
    <VCardText class="pt-0">
      <VForm ref="refForm" @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12" md="4">
            <AppTextField v-model="licenseForm.firstName" label="First Name" placeholder="Type in first name ..." :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="2">
            <AppTextField v-model="licenseForm.infix" label="Infix" placeholder="Type in infix ... "/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.lastName" label="Last Name" placeholder="Type in last name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.email" label="Email" placeholder="Type in email address ..." :rules="[requiredValidator, emailValidator]"/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.company" label="Company name" placeholder="Type in company name ..."
                          :rules="[requiredValidator]"/>
          </VCol>
          <VCol cols="12" md="4">
            <AppTextField v-model="licenseForm.address" label="Address" placeholder="Type in address ..."/>
          </VCol>
          <VCol cols="12" md="2">
            <AppTextField v-model="licenseForm.postalCode" label="Postalcode" placeholder="Type in postalcode ... "/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.state" label="State" placeholder="Type in state ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.city" label="City" placeholder="Type in city ..." />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="licenseForm.country"
              :items="countries"
              placeholder="Select a country ..."
              label="Country"
              name="selectCountry"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.website" label="Website" placeholder="Type in website ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField v-model="licenseForm.copyright" label="Copyright text" placeholder="Type in copyright text ..."/>
          </VCol>
          <VCol cols="12" md="12">
            <AppTextField v-model="licenseForm.emailSignature" label="Email signature" placeholder="Type in email signature ..."/>
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="licenseForm.plan"
              :items="plans"
              :rules="[requiredValidator]"
              placeholder="Select a plan ..."
              label="Plan"
              name="selectPlan"
              require
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppSelect
              v-model="licenseForm.subscriptionStatus"
              :items="subscriptionStatus"
              :rules="[requiredValidator]"
              placeholder="Select a subscription status ..."
              label="Subscription status"
              name="selectSubscriptionStatus"
              require
            />
          </VCol>
          <VCol cols="12">
            <VCol cols="12">
              <VBtn type="submit" class="me-2" :disabled="submittingData">
                <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate/>
                Save
                <VTooltip open-delay="500" activator="parent" location="top">Save the license data</VTooltip>
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
import {defineEmits, onMounted, ref, watchEffect} from 'vue';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore'
import {projectFirestore} from '@/firebase/config'
import AppTextField from '../../../@core/components/app-form-elements/AppTextField.vue'
import type {VForm} from 'vuetify/components'
import {useSnackbarStore} from '@/plugins/pinia/snackbarStore';
import {useI18n} from 'vue-i18n';
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import {useRoute} from "vue-router";
import {License} from "@/types/licenseType";

const isEditing = ref(false);
const { t } = useI18n();
const emit = defineEmits(['licenseUpdated']);
const firebaseCollectionName = 'Licenses'
const snackbar = useSnackbarStore();
const refForm = ref<VForm | null>(null);
const plans = ['Basic', 'Extended', 'Platinum']
const countries = ['Netherlands', 'Germany', 'Belgium']
const subscriptionStatus = ['Active', 'Arrears', 'Cancelled', 'Expired', 'Pending', 'Paused', 'Renewing', 'Trial']
const submittingData = ref(false)
const route = useRoute();
const snackbarStore = useSnackbarStore();
const licenseId = ref<string | null>(null);
const licenseForm = reactive({
  status: '',
  firstName: '',
  infix: '',
  lastName: '',
  email: '',
  company: '',
  address: '',
  postalCode: '',
  state: '',
  city: '',
  country: '',
  website: '',
  copyright: '',
  emailSignature: '',
  plan: '',
  subscriptionStatus: '',
  countUsers: 0
});

const resetForm = () => {
  licenseForm.status = '';
  licenseForm.firstName = '';
  licenseForm.infix = '';
  licenseForm.lastName = '';
  licenseForm.email = '';
  licenseForm.company = '';
  licenseForm.address = '';
  licenseForm.postalCode = '';
  licenseForm.state = '';
  licenseForm.city = '';
  licenseForm.country = '';
  licenseForm.website = '';
  licenseForm.copyright = '';
  licenseForm.emailSignature = '';
  licenseForm.plan = '';
  licenseForm.subscriptionStatus = '';
  licenseForm.countUsers = 0;
}

watchEffect(async () => {
  // Check if there is a query parameter id in the url.
  licenseId.value = route.query.id as string | null;
  if (licenseId.value == null) {
    isEditing.value = false;
    resetForm()
    emit('licenseUpdated', '');
    return;
  } else {
    isEditing.value = true;
    try {
      const licenseDocRef = doc(projectFirestore, firebaseCollectionName, String(licenseId.value));
      const licenseDocSnap = await getDoc(licenseDocRef);
      if (licenseDocSnap.exists()) {
        const licenseData = licenseDocSnap.data() as License;
        licenseForm.status = licenseData.status;
        licenseForm.firstName = licenseData.firstName;
        if (licenseData.infix != null) {
          licenseForm.infix = licenseData.infix;
        }
        licenseForm.lastName = licenseData.lastName;
        licenseForm.email = licenseData.email;
        licenseForm.company = licenseData.company;
        if (licenseData.address != null) {
          licenseForm.address = licenseData.address;
        }
        if (licenseData.postalCode != null) {
          licenseForm.postalCode = licenseData.postalCode;
        }
        if (licenseData.state != null) {
          licenseForm.state = licenseData.state;
        }
        if (licenseData.city != null) {
          licenseForm.city = licenseData.city;
        }
        if (licenseData.country != null) {
          licenseForm.country = licenseData.country;
        }
        if (licenseData.website != null) {
          licenseForm.website = licenseData.website;
        }
        if (licenseData.copyright != null) {
          licenseForm.copyright = licenseData.copyright;
        }
        if (licenseData.emailSignature != null) {
          licenseForm.emailSignature = licenseData.emailSignature;
        }
        licenseForm.plan = licenseData.plan;
        licenseForm.subscriptionStatus = licenseData.subscriptionStatus;
        licenseForm.countUsers = licenseData.countUsers;
        
        // Update the license id so other tabs come available in user/index.vue
        emit('licenseUpdated', licenseId);
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
        const License = {
          company: licenseForm.company,
          firstName: licenseForm.firstName,
          infix: licenseForm.infix,
          lastName: licenseForm.lastName,
          fullName: [licenseForm.firstName, licenseForm.infix, licenseForm.lastName].filter(Boolean).join(" "),
          email: licenseForm.email,
          plan: licenseForm.plan,
          address: licenseForm.address,
          postalCode: licenseForm.postalCode,
          city: licenseForm.city,
          state: licenseForm.state,
          country: licenseForm.country,
          website: licenseForm.website,
          copyright: licenseForm.copyright,
          emailSignature: licenseForm.emailSignature,
          status: licenseForm.status,
          subscriptionStatus: licenseForm.subscriptionStatus,
          countUsers: licenseForm.countUsers
        };
        try {
          const licensesCollection = collection(projectFirestore, firebaseCollectionName);
          console.log("LicenseId before add: " + licenseId.value)
          console.log("Check value isEditing: " + isEditing.toString())
          if (!isEditing.value) {
            License.status = "Active";
            License.countUsers = 0;
            const licenseDoc = doc(licensesCollection);
            await setDoc(licenseDoc, License);
            //licenseId.value = licenseDoc.id;
            emit('licenseUpdated', licenseId);
            console.log("LicenseId after add: " + licenseId.value)
            snackbarStore.showSnackbar({color: "success", message: t("License has been added successfully.")});
          } else {
            const licenseDoc = doc(licensesCollection, licenseId.value!);
            await setDoc(licenseDoc, License, {merge: true});
            snackbarStore.showSnackbar({color: "success", message: t("License has been updated successfully.")});
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

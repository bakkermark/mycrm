<script setup lang="ts">
import laptopGirl from '@images/illustrations/laptop-girl.png'
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue"
import { ref, computed } from 'vue';
import { defineProps } from 'vue'
import type {VForm} from "vuetify/components";
import UserLogins from "@/pages/user/components/UserLogins.vue";
import 'firebase/functions';
import {useI18n} from 'vue-i18n';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore";

const {t} = useI18n();
const functions = getFunctions();
const uid = ref<string | null>(null);
// Define props
const props = defineProps({
  uid: String
})
const snackbarStore = useSnackbarStore();
const submittingData = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const confirmPassword = ref('')
const password = ref('')
const refForm = ref<VForm | null>(null);
const rules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || 'Min 8 characters',
  lowercase: (v: string) => /[a-z]/.test(v) || 'At least one lowercase character',
  numberOrSymbol: (v: string) => /[\d\W]/.test(v) || 'At least one number or symbol',
}
const passwordRequirements = [
  'Minimum 8 characters long - the more, the better',
  'At least one lowercase character',
  'At least one number or symbol',
]

const passwordsMatch = computed(() => {
  return (value: string) => value === password.value || 'Passwords do not match';
});

interface cloudFunctionResponse {
  success: boolean;
  message: string;
  returnValue?: string;
}

const handleSubmit = async () => {
  if (refForm.value) { // Check if form has a value.
    const validationResult = await refForm.value.validate(); // Validating the form entries.
    if (validationResult.valid) { // If form is valid.
      submittingData.value = true; // Start the submission process.
      const functions = getFunctions(); // Get a reference to the Cloud Functions instance.
      console.log("updating password for uid: " + props.uid) // Logging uid for which the password is updated.
      const updateUserPassword = httpsCallable(functions, 'updateUserPassword'); // Creating a function reference for 'updateUserPassword' function in the Cloud Functions service.
      updateUserPassword({ uid: props.uid, newPassword: password.value }) // Calling the function with provided parameters.
        .then((result) => { // If function is successfully completed.
          const data = result.data as cloudFunctionResponse;
          if (!data.success) {
            // Show error message
            snackbarStore.showSnackbar({color: 'success', message: t(data.message)})
          } else {
            // Show success message
            snackbarStore.showSnackbar({color: "success", message: t('Password has been changed successfully.')})
          }
          submittingData.value = false; // End the submission process.
        })
        .catch((error) => { // If there's an error while executing the function.
          submittingData.value = false; // End the submission process.
          // Show error message
          snackbarStore.showSnackbar({color: 'error', message: t('An error occured. Password did not changed.')})
        });
    }
  }
}
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard title="Change Password">
        <VForm ref="refForm" @submit.prevent="handleSubmit">
          <VCardText class="pt-0">
            <VRow>
              <!-- 👉 New Password -->
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="password"
                  :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye' "
                  :rules="[rules.required, rules.min, rules.lowercase, rules.numberOrSymbol]"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  label="Password"
                  hint="At least 8 characters"
                  placeholder="············"
                  counter
                  @click:append-inner="showPassword = !showPassword"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="confirmPassword"
                  :rules="[rules.required, rules.min, rules.lowercase, rules.numberOrSymbol, passwordsMatch]"
                  :append-inner-icon="showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye' "
                  :type="showConfirmPassword ? 'text' : 'password'"
                  name="ConfirmPassword"
                  placeholder="············"
                  label="Confirm password"
                  hint="At least 8 characters"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <h6 class="text-base font-weight-medium mb-3">
              Password Requirements:
            </h6>

            <VList class="card-list">
              <VListItem
                v-for="item in passwordRequirements"
                :key="item"
                :title="item"
                class="text-medium-emphasis"
              >
                <template #prepend>
                  <VIcon
                    size="8"
                    icon="tabler-circle"
                    class="me-3"
                  />
                </template>
              </VListItem>
            </VList>
            <!-- 👉 Lady image -->
            <VCol
              cols="12"
              md="12"
              order="0"
              order-md="1"
              class="d-flex flex-column justify-center align-center"
            >
              <VImg
                :src="laptopGirl"
                :width="180"
                :style="$vuetify.display.smAndDown ? '' : 'position: absolute; bottom: 0;'"
              />
            </VCol>
            <VRow>
              <!-- 👉 Action Buttons -->
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
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
  </VRow>
  <VRow>
    <!-- Use the UserLogins component -->
    <UserLogins />
  </VRow>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 5px;
}

.server-close-btn {
  inset-inline-end: 0.5rem;
}
</style>

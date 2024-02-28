<script setup lang="ts">
import laptopGirl from '@images/illustrations/laptop-girl.png'
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import UserLogins from "@/pages/user/components/UserLogins.vue";
import { ref, computed } from 'vue';
import type {VForm} from "vuetify/components";

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

const handleSubmit = async () => {
  if (refForm.value) {
    const validationResult = await refForm.value.validate();
    if (validationResult.valid) {
      console.log("Moi man het werkt")
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

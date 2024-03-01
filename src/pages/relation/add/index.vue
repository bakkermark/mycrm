<template>
  <div>
    <h1>Add Relation</h1>
    <VBtn type="submit" class="me-2" @click="triggerEmail">
      Send email
      <VTooltip open-delay="500" activator="parent" location="top">Send test email</VTooltip>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { sendTemplateEmail } from '@/utils/emailService/emailService'
import { User, EmailInputData } from '@/utils/emailService/emailTypes'
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore"
import {useI18n} from 'vue-i18n'

const { t } = useI18n()
const snackbarStore = useSnackbarStore()

async function triggerEmail() {
  const user: User = {
    id: "user123",
    firstName: "Mark",
    lastName: "Bakker",
    fullName: "Mark Bakker",
    email: "bakker.mark@outlook.com",
    role: "Admin",
    status: "Active",
    createdAt: new Date(),
    company: "Example Company",
    licenseCode: "XYZ123",
    plan: "Platinum",
  }

  const emailData: EmailInputData = {
    templateName: "user_activation",
    licenseCode: '99999999',
    user,
  }

  try {
    const result = await sendTemplateEmail(emailData)
    if (result.success) {
      snackbarStore.showSnackbar({ color: "success", message: t(result.message) })
    } else {
      snackbarStore.showSnackbar({ color: "error", message: t(result.message) })
    }
  } catch (error: any) {
    snackbarStore.showSnackbar({ color: "error", message: t(`Error occurred during sending email. Details: ${error.message}`) })
  }
}
</script>

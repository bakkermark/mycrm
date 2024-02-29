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
import { User, TemplateEmailData } from '@/utils/emailService/emailTypes'
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

  const emailData: TemplateEmailData = {
    templateName: "user_activation",
    licenseCode: '99999999',
    user,
  }

  try {
    const result = await sendTemplateEmail(emailData)
    console.log("Result: ", result)
    if (result.success) {
      snackbarStore.showSnackbar({ color: "success", message: t("Email sent succesfully.") })
    } else {
      snackbarStore.showSnackbar({ color: "error", message: t("Email could not be sent.") })
    }
  } catch (error: any) {
    snackbarStore.showSnackbar({ color: "error", message: t(`Error occurred during sending email. Details: ${error.message}`) })
  }
}
</script>

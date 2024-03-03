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
import { emailServiceInputData } from '@/utils/emailService/emailTypes'
import {User} from '@/types/userType'
import {useSnackbarStore} from "@/plugins/pinia/snackbarStore"
import {useI18n} from 'vue-i18n'
import {License} from "@/pages/license/licenseTypes";

const { t } = useI18n()
const snackbarStore = useSnackbarStore()

async function triggerEmail() {
  const user: User = {
    id: "nDj8Itux38XGHvP1BnSkH2pjhw43",
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

  const license: License = {
    id: "KDjghg7EvDApqu46yoIw",
    company: "MultiMediaMarkers",
    email: "bakker.mark@outlook.com",
    firstName: "Mark",
    fullName: "Mark Bakker",
    infix: '',
    lastName: "Bakker",
    plan: "Platinum",
  }

  const emailData: emailServiceInputData = {
    templateName: "user_activation",
    user,
    license
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

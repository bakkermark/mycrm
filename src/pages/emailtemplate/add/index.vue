<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon icon="tabler-user"/>Emailtemplate</VTab>
    <VTab v-if="id"><VIcon icon="tabler-lock"/>Campaign</VTab>
  </VTabs>

  <VCardText>
    <VWindow v-model="currentTab">
      <VWindowItem :value="0">
        <EmailTemplateSettings @licenseUpdated="handleEmailTemplateUpdated" />
      </VWindowItem>
      <VWindowItem :value="1" v-if="id">
        
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<script setup lang="ts">
import LicenseSettingsBilling from '../components/LicenseSettingsBilling.vue';
import EmailTemplateSettings from "@/pages/emailtemplate/components/EmailTemplateSettings.vue";
const currentTab = ref(0);
const id = ref<string | null>(null); // Initially, no uid is known

// Handler for the userUpdated event
function handleEmailTemplateUpdated(newId: string) {
  id.value = newId; // Update id to show other tabs
  //currentTab.value = 1; // Switch to the Billing tab
}
</script>

<style></style>


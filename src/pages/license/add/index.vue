<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon icon="tabler-user"/>License</VTab>
    <VTab v-if="id"><VIcon icon="tabler-lock"/>Billing</VTab>
  </VTabs>

  <VCardText>
    <VWindow v-model="currentTab">
      <!-- Account Tab Content -->
      <VWindowItem :value="0">
        <!-- Use the LicenseSettings component -->
        <LicenseSettings @licenseUpdated="handleLicenseUpdated" />
      </VWindowItem>
      <!-- Security Tab Content -->
      <VWindowItem :value="1" v-if="id">
        <!-- Use the LicenseSettingsBilling component -->
        <LicenseSettingsBilling :id="id" />
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<script setup lang="ts">
import LicenseSettings from '../components/LicenseSettings.vue';
import LicenseSettingsBilling from '../components/LicenseSettingsBilling.vue';
const currentTab = ref(0);
const id = ref<string | null>(null); // Initially, no uid is known

// Handler for the userUpdated event
function handleLicenseUpdated(newId: string) {
  id.value = newId; // Update id to show the Billing tab
  currentTab.value = 1; // Switch to the Billing tab
}
</script>

<style></style>

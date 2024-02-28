<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon icon="tabler-user"/>User</VTab>
    <VTab v-if="uid"><VIcon icon="tabler-lock"/>Security</VTab>
  </VTabs>

  <VCardText>
    <VWindow v-model="currentTab">
      <!-- Account Tab Content -->
      <VWindowItem :value="0">
        <!-- Use the UserSettings component -->
        <UserSettings @userUpdated="handleUserUpdated" />
      </VWindowItem>
      <!-- Security Tab Content -->
      <VWindowItem :value="1" v-if="uid">
        <!-- Use the UserSettingsSecurity component -->
        <UserSettingsSecurity :uid="uid" />
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<script setup lang="ts">
import UserSettings from "@/pages/user/components/UserSettings.vue";
import UserSettingsSecurity from "@/pages/user/components/UserSettingsSecurity.vue";
const currentTab = ref(0);
const uid = ref<string | null>(null); // Initially, no uid is known

// Handler for the userUpdated event
function handleUserUpdated(newUid: string) {
  uid.value = newUid; // Update uid to show the Security tab
  currentTab.value = 1; // Switch to the Security tab
}
</script>

<style></style>

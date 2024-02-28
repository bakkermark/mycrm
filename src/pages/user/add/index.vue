<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon icon="tabler-user"/>User</VTab>
    <VTab><VIcon icon="tabler-lock"/>Security</VTab>
  </VTabs>

  <VCardText>
    <VWindow v-model="currentTab">
      <!-- Account Tab Content -->
      <VWindowItem :value="0">
        <!-- Use the UserSettings component -->
        <UserSettings />
      </VWindowItem>
      <!-- Security Tab Content -->
      <VWindowItem :value="1">
        <!-- Use the UserSettingsSecurity component -->
        <UserSettingsSecurity />
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<script setup lang="ts">
import UserSettings from "@/pages/relation/components/UserSettings.vue";
import UserSettingsSecurity from "@/pages/user/components/UserSettingsSecurity.vue";
const currentTab = ref(0);
</script>

<style></style>

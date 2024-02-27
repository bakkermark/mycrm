<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon icon="tabler-user"/>Account</VTab>
    <VTab><VIcon icon="tabler-lock"/>Security</VTab>
    <VTab><VIcon icon="tabler-file-dollar"/>Billing & Plans</VTab>
  </VTabs>

  <VCard class="mt-5">
    <VCardText>
      <VWindow v-model="currentTab">
        <!-- Account Tab Content -->
        <VWindowItem :value="0">
          <!-- Use the UserSettings component -->
          <UserSettings />
        </VWindowItem>

        <!-- Security Tab Content -->
        <VWindowItem :value="1">
          <div>Security settings</div>
        </VWindowItem>

        <!-- Billing & Plans Tab Content -->
        <VWindowItem :value="2">
          <div>Billing information</div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import UserSettings from "@/pages/relation/components/UserSettings.vue";
const currentTab = ref(0);
</script>

<style></style>

<template>
  <VTabs
    v-model="currentTab"
    class="v-tabs-pill"
  >
    <VTab><VIcon class="icon-class" icon="tabler-message-2-question"/>Question</VTab>
    <VTab v-if="id"><VIcon icon="tabler-chart-infographic"/>Statistics</VTab>
  </VTabs>

  <VCardText>
    <VWindow v-model="currentTab">
      <VWindowItem :value="0">
        <triviaQuestionAdd @licenseUpdated="handleIdUpdated" />
      </VWindowItem>
      <VWindowItem :value="1" v-if="id">
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<script setup lang="ts">
import triviaQuestionAdd from "@/pages/triviaQuestion/components/triviaQuestionAdd.vue";
const currentTab = ref(0);
const id = ref<string | null>(null); // Initially, no uid is known

// Handler for the userUpdated event
function handleIdUpdated(newId: string) {
  id.value = newId; // Update id to show other tabs
  //currentTab.value = 1;
}
</script>

<style scoped>
.icon-class {
  margin-right: 5px;
}
</style>


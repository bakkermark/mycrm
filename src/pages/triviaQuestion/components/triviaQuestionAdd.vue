<template>
  <div>
    <v-select
      v-model="selectedCategory"
      :items="hardcodedCategories"
      label="Select a category"
      item-text="Name"
      item-value="id"
      placeholder="Select a category"
    ></v-select>
    <p>Selected Category: {{ selectedCategory }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const selectedCategory = ref<string>('');

const hardcodedCategories = [
  { Name: 'Cultuur', id: '0hBUeMHD6aW8xIROWhX0' },
  { Name: 'Humor', id: '5rndpaeDeeUm1fSCscci' },
  { Name: 'Nieuws', id: 'SCqQ2KmwbGh6fzinfbvI' },
  { Name: 'Social Media', id: 'TIVJ7Z3pYAqlgg7ieVzs' },
  { Name: 'Sport', id: 'TDQZaf6jP38PxpnZNAwB' },
  { Name: 'Wetenschap', id: '4tNp7DMEZUEYynVETVGA' }
];
</script>

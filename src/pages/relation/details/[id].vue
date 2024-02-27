<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id
</script>

<template>
  <h1>Details relation</h1>
  <p>Current relation id: {{ id }}</p>
</template>

<style scoped lang="scss">

</style>

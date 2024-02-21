<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { useSnackbarStore } from '@/plugins/pinia/snackbarStore';
const snackbar = useSnackbarStore();

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />

      <ScrollToTop />
      <VSnackbar
        v-model="snackbar.isVisible"
        :timeout="3000"
        location="top end"
        transition="fade-transition"
        variant="flat"
        :color="snackbar.color"
      >
        {{ snackbar.message }}
      </VSnackbar>
    </VApp>
  </VLocaleProvider>
</template>

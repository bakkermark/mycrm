import { defineStore } from 'pinia';

export const useLicenseStore = defineStore('license', {
  state: () => ({
    licenseCode: null as string | null,
  }),
  actions: {
    setLicenseCode(newLicenseCode: string) {
      this.licenseCode = newLicenseCode;
    },
  },
  persist: {
    enabled: true, // Enable persistence
    strategies: [{
      key: 'license', // The key under which your store's state will be stored in the storage
      storage: localStorage, // Specify the storage type, localStorage for persistent across sessions, or sessionStorage for a single session
    }]
  },
});

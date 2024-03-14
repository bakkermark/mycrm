import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null as string | null,
    userLicenseCode: null as string | null,
    userFullName: null as string | null,
    userRole: null as 'Standard User' | 'Admin' | 'SuperAdmin' | null,
  }),
  actions: {
    setUserId(newUserId: string) {
      this.userId = newUserId;
    },
    setUserLicenseCode(newLicenseCode: string) {
      this.userLicenseCode = newLicenseCode;
    },
    setUserFullName(newFullName: string) {
      this.userFullName = newFullName;
    },
    setUserRole(newRole: 'Standard User' | 'Admin' | 'SuperAdmin') {
      this.userRole = newRole;
    }
  },
  persist: {
    enabled: true, // Enable persistence
    strategies: [{
      key: 'user', // The key under which your store's state will be stored in the storage
      storage: localStorage, // Specify the storage type, localStorage for persistent across sessions, or sessionStorage for a single session
    }]
  },
});

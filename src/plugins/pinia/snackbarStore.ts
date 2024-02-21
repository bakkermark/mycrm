import { defineStore } from 'pinia';

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    isVisible: false,
    color: '',
    message: '',
  }),
  actions: {
    showSnackbar(payload: { color: string; message: string }) {
      this.isVisible = true;
      this.color = payload.color;
      this.message = payload.message;
    },
    hideSnackbar() {
      this.isVisible = false;
    },
  },
});

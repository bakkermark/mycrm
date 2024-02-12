import { createPinia } from 'pinia';
import piniaPluginPersist from 'pinia-plugin-persist';
import type { App } from 'vue';

export const store = createPinia();
store.use(piniaPluginPersist);

export default function (app: App) {
  app.use(store);
}

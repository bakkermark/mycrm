import { createApp } from 'vue';
import App from '@/App.vue';
import { registerPlugins } from '@/@core/utils/plugins';
import '@core/scss/template/index.scss';
import '@styles/styles.scss';
// Import the Firebase services that you want to use
import { firebaseApp, analytics, projectFirestore, auth, projectStorage, functions } from '@/firebase/config';

const app = createApp(App);
app.config.globalProperties.$firebase = firebaseApp;
app.config.globalProperties.$analytics = analytics;
app.config.globalProperties.$db = projectFirestore;
app.config.globalProperties.$auth = auth;
app.config.globalProperties.$storage = projectStorage;
app.config.globalProperties.$functions = functions;

registerPlugins(app);
app.mount('#app');

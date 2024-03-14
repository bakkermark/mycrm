<script setup lang="ts">
import { ref } from 'vue';
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useLicenseStore } from '@/plugins/pinia/licenseStore';
import { useUserStore } from '@/plugins/pinia/userStore';
import { auth } from '@/firebase/config';
import UAParser from 'ua-parser-js';
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";

definePage({
  meta: {
    layout: 'blank',
  },
})

const submittingData = ref(false)
const router = useRouter();
const form = ref({
  email: '',
  password: '',
  remember: false,
})
const isPasswordVisible = ref(false)
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark,true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const handleLogin = async () => {
  signInWithEmailAndPassword(auth, form.value.email, form.value.password)
    .then(async (userCredential) => {
      submittingData.value = true;
      const user = userCredential.user;
      let licenseCode = '';
      if (user !== null && user.email !== null) {
        const firestore = getFirestore();
        const usersCollection = collection(firestore, "Users");
        const userEmailQuery = query(usersCollection, where("email", "==", user.email));
        const querySnapshot = await getDocs(userEmailQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          licenseCode = data.licenseCode;
          const userStore = useUserStore();
          userStore.setUserId(data.id);
          userStore.setUserRole(data.role);
          userStore.setUserFullName(data.fullName);
          userStore.setUserLicenseCode(licenseCode)
          //TODO remove console.log
          console.log("User " + data.fullName +  " logged in succesfully and has licenseCode: " + data.licenseCode + " and role " + data.role + " and userId " + data.id)
        } else {
          // Write error to logfile.
          console.log("User not found or password incorrect.");
        }
        
        // Extracting browser, OS, and device information using UAParser
        const parser = new UAParser();
        const result = parser.getResult();
        const browser = `${result.browser.name}`;
        const browserVersion = `${result.browser.version}`;
        const os = `${result.os.name}`;
        const osVersion = `${result.os.version}`;
        const deviceModel = result.device.model || 'unknown device';
        const deviceType = `${result.device.type || 'type unknown'}`;

        // Prepare the data to send to your Cloud Function
        const loginInfo = {
          userId: user.uid,
          licenseId: licenseCode,
          browser: browser,
          browserVersion: browserVersion,
          os: os,
          osVersion: osVersion,
          device: deviceModel,
          deviceType: deviceType
        };

        // Call your Cloud Function
        await fetch('https://us-central1-dev-mycrm.cloudfunctions.net/addLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginInfo),
        })
          .then(response => response.json())
          .then(data => {
            router.push({ name: 'root' });
          })
          .catch((error) => {
            //TODO Write error to logfile.
            console.error('Error:', error);
          });
      }
    })
    .catch((error) => {
      //TODO Write error to logfile.
      submittingData.value = false;
    });
  
};
</script>


<template>
  <VRow
    no-gutters="true"
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="505"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat="true"
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                  <VCheckbox
                    v-model="form.remember"
                    label="Remember me"
                  />
                  <a
                    class="text-primary ms-2 mb-1"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>

                <VBtn block="true" type="submit" :disabled="submittingData">
                  <VProgressCircular v-if="submittingData" :size="20" :width="2" class="mr-2" indeterminate/>
                  {{ submittingData ? 'Please wait ...' : 'Login' }}
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span>New on our platform?</span>

                <a
                  class="text-primary ms-2"
                  href="#"
                >
                  Create an account
                </a>
              </VCol>

              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />

                <span class="mx-4">or</span>

                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

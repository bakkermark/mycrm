<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import getUserLogins from '../../../composables/user/getUserLogins'
import netherlandsIcon from "../../../assets/icons/flags/netherlands_icon.png";
import germanyIcon from "../../../assets/icons/flags/germany_icon.png";
import belgiumIcon from "../../../assets/icons/flags/belgium_icon.png";
import luxembourgIcon from "../../../assets/icons/flags/luxembourg_icon.png";
import franceIcon from "../../../assets/icons/flags/france_icon.png";
import { useUserStore } from '@/plugins/pinia/userStore';

// Accessing its state
const userStore = useUserStore();
const licenseId = userStore.userLicenseCode;
const userId = userStore.userId;

// Initialize composable
const { data: recentLogins, error, load } = getUserLogins(licenseId, userId);

const recentDevicesHeaders = [
  {
    title: 'BROWSER',
    key: 'browser',
  },
  {
    title: 'DEVICE',
    key: 'device',
  },{
    title: 'OS',
    key: 'os',
  },
  {
    title: 'LOCATION',
    key: 'city',
  },
  {
    title: 'REGION',
    key: 'region',
  },
  {
    title: 'COUNTRY',
    key: 'country',
  },
  {
    title: 'RECENT ACTIVITY',
    key: 'createdAtFormatted',
  },
]

const resolveBrowserIcon = (browser: string) => {
  const browserLowerCase = browser.toLowerCase();
  
  if (browserLowerCase === 'chrome') {
    return { color: 'success', icon: 'tabler-brand-chrome' };
  }
  if (browserLowerCase.includes('safari')) {
    return { color: 'error', icon: 'tabler-brand-safari' };
  }
  if (browserLowerCase === 'edge') {
    return { color: 'warning', icon: 'tabler-brand-edge' };
  }
  if (browserLowerCase === 'firefox') {
    return { color: 'warning', icon: 'tabler-brand-firefox' };
  }
  if (browserLowerCase === 'opera') {
    return { color: 'success', icon: 'tabler-brand-opera' };
  }
  if (browserLowerCase === 'android browser') {
    return { color: 'success', icon: 'tabler-brand-android' };
  }
  return { color: 'default', icon: 'tabler-question-mark'};
};

const resolveDeviceIcon = (device: string) => {
  const deviceLowerCase = device.toLowerCase();

  if (deviceLowerCase === 'macintosh') {
    return { color: 'default', icon: 'tabler-device-desktop' };
  }
  if (deviceLowerCase === 'iphone') {
    return { color: 'default', icon: 'tabler-device-mobile' };
  }
  if (deviceLowerCase === 'ipad') {
    return { color: 'default', icon: 'tabler-device-ipad' };
  }
  return {color: 'default', icon: 'tabler-devices-question'}
};

const resolveOsIcon = (os: string) => {
  const osLowerCase = os.toLowerCase();

  if (osLowerCase === 'mac os') {
    return { color: 'default', icon: 'tabler-brand-apple' };
  }
  if (osLowerCase === 'ios') {
    return { color: 'default', icon: 'tabler-brand-apple' };
  }
  if (osLowerCase === 'windows') {
    return { color: 'default', icon: 'tabler-brand-windows' };
  }
  return { color: 'default', icon: 'tabler-question-mark'}
};

const resolveCountryIcon = (country: string) => {
  const countryLowerCase = country.toLowerCase();

  if (countryLowerCase === 'netherlands') {
    return netherlandsIcon;
  }
  if (countryLowerCase === 'belgium') {
    return belgiumIcon;
  }
  if (countryLowerCase === 'germany') {
    return germanyIcon;
  }
  if (countryLowerCase === 'luxembourg') {
    return luxembourgIcon;
  }
  if (countryLowerCase === 'france') {
    return franceIcon;
  }
};

// Fetch the data when component is mounted
onMounted(() => {
  load().catch(console.error);
});
</script>

<template>
  <VCol cols="12">
    <!-- 👉 Table -->
    <VCard title="Recent logins">
      <VDataTable
        :headers="recentDevicesHeaders"
        :items="recentLogins"
        hide-default-footer
        class="text-no-wrap"
      >
        <template #item.browser="{ item }">
          <div class="d-flex">
            <VIcon
              start
              :icon="resolveBrowserIcon(item.browser).icon"
              :color="resolveBrowserIcon(item.browser).color"
            />
            <span>
                {{ item.browser }}
              </span>
          </div>
        </template>
        <template #item.device="{ item }">
          <div class="d-flex">
            <VIcon
              start
              :icon="resolveDeviceIcon(item.device).icon"
              :color="resolveDeviceIcon(item.device).color"
            />
            <span>
                {{ item.device }}
              </span>
          </div>
        </template>
        <template #item.os="{ item }">
          <div class="d-flex">
            <VIcon
              start
              :icon="resolveOsIcon(item.os).icon"
              :color="resolveOsIcon(item.os).color"
            />
            <span>
                {{ item.os }}
              </span>
          </div>
        </template>
        <template #item.country="{ item }">
          <div class="d-flex">
            <img height="24px" :src="resolveCountryIcon(item.country)" class="mr-2"></img>
            <span>{{ item.country }}</span>
          </div>
        </template>
        <!-- TODO Refactor this after vuetify provides proper solution for removing default footer -->
        <template #bottom />
      </VDataTable>
    </VCard>
  </VCol>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 5px;
}

.server-close-btn {
  inset-inline-end: 0.5rem;
}
</style>

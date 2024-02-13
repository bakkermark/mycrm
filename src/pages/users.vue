<template>
  <h1>{{ $t('users') }}</h1>
  <br/>
  <div>
    <VTable
      density="compact"
      height="500"
      fixed-header=true
      class="text-no-wrap"
    >
      <thead>
      <tr>
        <th class="text-uppercase">
          {{ $t('firstname') }}
        </th>
        <th class="text-uppercase">
          {{ $t('infix') }}
        </th>
        <th class="text-uppercase">
          {{ $t('lastname') }}
        </th>
        <th class="text-uppercase">
          {{ $t('email') }}
        </th>
        <th class="text-uppercase">
          {{ $t('role') }}
        </th>
        <th class="text-uppercase">
          {{ $t('created') }}
        </th>
        <th class="text-uppercase">
          {{ $t('licensee') }}
        </th>
        <th class="text-uppercase">
          {{ $t('Active') }}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="item in users"
        :key="item.uid"
      >
        <td>
          {{ item.extra.FirstName }}
        </td>
        <td>
          {{ item.extra.Infix }}
        </td>
        <td>
          {{ item.extra.LastName }}
        </td>
        <td>
          {{ item.email }}
        </td>
        <td>
          {{ item.extra.Role }}
        </td>
        <td>
          {{ formatDate(item.extra.Created) }}
        </td>
        <td>
          {{ item.extra.LicenseCode }}
        </td>
        <td>
          {{ item.extra.Active }}
        </td>
      </tr>
      </tbody>
    </VTable>
  </div>
</template>

<script>
// Import necessary Firebase modules
import { getFunctions, httpsCallable } from 'firebase/functions';
// Import the firebase app from your config
import { app } from '@/firebase/config'; // Replace with path to your config file

export default {
  data: () => ({
    users: [],
  }),
  created() {
    this.fetchUsers();
  },
  methods: {
    formatDate(timestamp) {
      if (timestamp) {
        const date = new Date(timestamp._seconds * 1000);

        // Formatting day and month to always have 2 digits
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();

        // Formatting hours and minutes to always have 2 digits
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);

        return `${day}-${month}-${year} ${hours}:${minutes}`;
      }
      return '';
    },
    async fetchUsers() {
      // Use the already-initialized app from config file
      const functions = getFunctions(app);
      const getUsers = httpsCallable(functions, 'getUsers');

      try {
        const result = await getUsers();
        this.users = result.data;
      } catch (error) {
        console.error('Error while fetching users:', error);
      }
    },
  },
};
</script>


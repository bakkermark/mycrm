<template>
  <h1>{{ $t('users') }}</h1>
  <br/>
  <div>
    <VTable
      density="compact"
      height="500"
      fixed-header="true"
      class="text-no-wrap"
    >
      <thead>
      <tr>
        <th class="text-uppercase">
          {{ $t('identifier') }}
        </th>
        <th class="text-uppercase">
          {{ $t('display name') }}
        </th>
        <th class="text-uppercase">
          {{ $t('email') }}
        </th>
        <th class="text-uppercase">
          {{ $t('Disabled?') }}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="item in users"
        :key="item.uid"
      >
        <td>
          {{ item.uid }}
        </td>
        <td>
          {{ item.displayName }}
        </td>
        <td>
          {{ item.email }}
        </td>
        <td>
          {{ item.disabled }}
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


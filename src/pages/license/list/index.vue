<template>
  <h1>{{ $t('License overview') }}</h1>
  <br/>
  <div >
    <VTable
      density="compact"
      height="500"
      fixed-header
      class="text-no-wrap"
    >
      <thead>
      <tr>
        <th class="text-uppercase">
          {{ $t('company') }}
        </th>
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
          {{ $t('licensecode') }}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="item in licenses"
        :key="item.Email"
      >
        <td>
          {{ item.Company }}
        </td>
        <td>
          {{ item.FirstName }}
        </td>
        <td>
          {{ item.Infix }}
        </td>
        <td>
          {{ item.LastName }}
        </td>
        <td>
          {{ item.Email }}
        </td>
        <td>
          {{ item.id }}
        </td>
      </tr>
      </tbody>
    </VTable>
  </div>
</template>

<script>
import getLicenses from "../../../composables/getLicenses";

export default {
  name: 'Licenses',
  setup() {
    const { licenses, error, load } = getLicenses();

    load().then(() => {
      // Check if licenses.value is an instance of Array and then log its length
      if (licenses.value instanceof Array) {
        console.log('The number of licenses is: ', licenses.value.length);
      }
    }).catch((err) => {
      // You can use the returned error value as well
      console.log('An error occurred: ', err);
      console.log('Error value from getLicenses: ', error.value);
    });

    return { licenses, error };
  },
}
</script>

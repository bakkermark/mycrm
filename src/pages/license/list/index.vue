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
          {{ $t('fullname') }}
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
        :key="item.email"
      >
        <td>
          {{ item.company }}
        </td>
        <td>
          {{ item.fullName }}
        </td>
        <td>
          {{ item.email }}
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
    }).catch((err) => {
      console.log('An error occurred: ', err);
    });

    return { licenses, error };
  },
}
</script>

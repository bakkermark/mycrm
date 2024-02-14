<template>
  <h1>{{ $t('Contacts overview') }}</h1>
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
          {{ $t('lastname') }}
        </th>
        <th class="text-uppercase">
          {{ $t('email') }}
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="item in contacts"
        :key="item.Code"
      >
        <td>
          {{ item.Company }}
        </td>
        <td>
          {{ item.FirstName }}
        </td>
        <td>
          {{ item.LastName }}
        </td>
        <td>
          {{ item.Email }}
        </td>
      </tr>
      </tbody>
    </VTable>
  </div>
</template>

<script>
import getContacts from '../composables/getContacts'

export default {
  name: 'Contacts',
  setup() {
    const { contacts, error, load } = getContacts()

    load()

    return { contacts, error }
  },
}
</script>

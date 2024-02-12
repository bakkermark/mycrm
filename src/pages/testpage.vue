<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import data from '../views/demos/forms/tables/data-table/datatable'

// Headers
const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'FullName', key: 'fullName' },
  { title: 'Email', key: 'email' },
  { title: 'Type', key: 'type' },
]
const resolveStatusVariant = (type: number) => {
  if (type === 1)
    return { color: 'success', text: 'Customer' }
  else if (type === 2)
    return { color: 'success', text: 'Lead' }
  else if (type === 3)
    return { color: 'primary', text: 'Prospect' }
}
</script>

<template>
  <VDataTable
    :headers="headers"
    :items="data"
    :items-per-page="5"
    expand-on-click
  >
    <!-- Expanded Row Data -->
    <template #expanded-row="slotProps">
      <tr class="v-data-table__tr">
        <td :colspan="headers.length">
          <p class="my-1">
            City: {{ slotProps.item.city }}
          </p>
          <p class="my-1">
            Experience: {{ slotProps.item.experience }}
          </p>
          <p>Post: {{ slotProps.item.post }}</p>
        </td>
      </tr>
    </template>

    <!-- full name -->
    <template #item.fullName="{ item }">
      <div class="d-flex align-center">
        <VAvatar
          size="32"
          :color="item.avatar ? '' : 'primary'"
          :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
          :variant="!item.avatar ? 'tonal' : undefined"
        >
          <VImg
            v-if="item.avatar"
            :src="item.avatar"
          />
          <span v-else>{{ avatarText(item.fullName) }}</span>
        </VAvatar>
        <div class="d-flex flex-column ms-3">
          <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.fullName }}</span>
          <small>{{ item.post }}</small>
        </div>
      </div>
    </template>

    <template #item.type="{ item }">
      <VChip
        :color="resolveStatusVariant(item.type).color"
        class="font-weight-medium"
        size="small"
      >
        {{ resolveStatusVariant(item.type).text }}
      </VChip>
    </template>
  </VDataTable>
</template>

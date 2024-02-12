<template>
  <div class="h-100 d-flex align-center justify-space-between">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}
      Made with
      <VIcon
        icon="tabler-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
      href="https://multimediamarkers.com"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary ms-1"
    >MultiMediaMarkers</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="https://console.firebase.google.com/project/dev-mycrm/overview"
        target="noopener noreferrer"
      >Overview FB</a>
      <a
        href="https://console.firebase.google.com/project/dev-mycrm/hosting/sites/dev-mycrm"
        target="noopener noreferrer"
      >Hosting FB</a>
      <a
        href="https://console.firebase.google.com/project/dev-mycrm/firestore/data/~2FContacts~2FDE4i7Tul5LsZF8BAjvDD"
        target="noopener noreferrer"
      >Database FS</a>
      <a
        href="https://console.firebase.google.com/project/dev-mycrm/storage/dev-mycrm.appspot.com/files"
        target="noopener noreferrer"
      >Storage FS</a>
      <a
        href="https://demos.pixinvent.com/vuexy-vuejs-admin-template/documentation/"
        target="noopener noreferrer"
      >Template documentation</a>
      <a
        href="https://tablericons.com/"
        target="noopener noreferrer"
      >Tabler icons</a>
    </span>
  </div>
</template>
<script setup>
</script>

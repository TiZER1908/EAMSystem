<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <AppHeader />

    <main class="app-layout__content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f1f5f9;
}

.app-layout__content {
  margin-left: 260px;
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
}
</style>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import ToastStack from '@/components/ToastStack.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
</script>

<template>
  <a class="skip-link" href="#main">Skip to main content</a>
  <AppHeader />
  <main id="main" class="container" tabindex="-1">
    <RouterView />
  </main>
  <footer class="site-footer">
    <div class="container">CIS 3339 · Student Management System · Vue 3 + Express + MongoDB</div>
  </footer>
  <ToastStack />
  <ConfirmDialog />
</template>

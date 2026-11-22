<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const links = [
  { to: '/', label: 'Home' },
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollments', label: 'Enrollments' },
];

// Mobile menu open/closed
const menuOpen = ref(false);
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  }
);
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Student Management</span>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? 'Close' : 'Open' }} menu</span>
        <span aria-hidden="true">{{ menuOpen ? '✕' : '☰' }}</span>
      </button>

      <nav id="main-nav" class="main-nav" :class="{ open: menuOpen }" aria-label="Main">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :exact-active-class="link.to === '/' ? 'active' : ''"
          :active-class="link.to === '/' ? '' : 'active'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

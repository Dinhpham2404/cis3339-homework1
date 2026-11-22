<script setup>
import { ref } from 'vue';
import { useStudentsStore } from '@/stores/students';
import { useNotificationsStore } from '@/stores/notifications';

const students = useStudentsStore();
const notify = useNotificationsStore();

// Start with the last search so it is kept when you change pages.
const term = ref(students.searchTerm);
const error = ref('');

async function onSearch() {
  error.value = '';
  if (!term.value.trim()) {
    error.value = 'Enter a name or student ID to search.';
    return;
  }
  try {
    await students.search(term.value);
  } catch (err) {
    notify.error(`Search failed: ${err.message}`);
  }
}

function onClear() {
  term.value = '';
  error.value = '';
  students.clearSearch();
}
</script>

<template>
  <form class="search-form" role="search" novalidate @submit.prevent="onSearch">
    <label for="student-search">Search by name or student ID</label>
    <div class="search-row">
      <input
        id="student-search"
        v-model="term"
        type="search"
        placeholder="e.g. John or 1001"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="error ? 'student-search-error' : undefined"
        @input="error = ''"
      />
      <button type="submit" class="btn btn-primary" :disabled="students.searching">
        {{ students.searching ? 'Searching...' : 'Search' }}
      </button>
      <button v-if="students.hasSearched || term" type="button" class="btn btn-secondary" @click="onClear">Clear</button>
    </div>
    <small v-if="error" id="student-search-error" class="field-error">{{ error }}</small>
  </form>
</template>

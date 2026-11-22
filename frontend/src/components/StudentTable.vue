<script setup>
// Table of students. On small screens each row becomes a card (see main.css).
defineProps({
  students: { type: Array, required: true },
  caption: { type: String, required: true },
  busyId: { type: String, default: '' },
  showEnrollments: { type: Boolean, default: true },
  actionLabel: { type: String, default: 'Delete' },
});
defineEmits(['action']);
</script>

<template>
  <div class="table-wrap">
    <table class="data-table responsive-table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Student ID</th>
          <th scope="col">Phone</th>
          <th scope="col">ZIP</th>
          <th v-if="showEnrollments" scope="col">Courses</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td data-label="Name">{{ student.name }}</td>
          <td data-label="Student ID">{{ student.studentId }}</td>
          <td data-label="Phone">{{ student.phone }}</td>
          <td data-label="ZIP">{{ student.zip }}</td>
          <td v-if="showEnrollments" data-label="Courses">{{ student.enrollmentCount ?? 0 }}</td>
          <td class="actions">
            <button
              type="button"
              class="btn btn-small btn-danger-outline"
              :disabled="busyId === student.studentId"
              :aria-label="`${actionLabel} ${student.name} (${student.studentId})`"
              @click="$emit('action', student)"
            >
              {{ busyId === student.studentId ? 'Working...' : actionLabel }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

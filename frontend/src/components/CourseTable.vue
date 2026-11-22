<script setup>
defineProps({
  courses: { type: Array, required: true },
  busyId: { type: String, default: '' },
});
defineEmits(['delete', 'view-roster']);
</script>

<template>
  <div class="table-wrap">
    <table class="data-table responsive-table">
      <caption class="sr-only">All courses</caption>
      <thead>
        <tr>
          <th scope="col">Course ID</th>
          <th scope="col">Course name</th>
          <th scope="col">Enrolled</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.id">
          <td data-label="Course ID"><strong>{{ course.courseId }}</strong></td>
          <td data-label="Course name">{{ course.name }}</td>
          <td data-label="Enrolled">{{ course.enrollmentCount ?? 0 }}</td>
          <td class="actions">
            <button
              type="button"
              class="btn btn-small btn-secondary"
              :aria-label="`View students in ${course.courseId}`"
              @click="$emit('view-roster', course)"
            >
              Roster
            </button>
            <button
              type="button"
              class="btn btn-small btn-danger-outline"
              :disabled="busyId === course.courseId"
              :aria-label="`Delete ${course.courseId} ${course.name}`"
              @click="$emit('delete', course)"
            >
              {{ busyId === course.courseId ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

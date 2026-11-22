import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  // Normal URLs like /students (Express sends index.html for them on refresh).
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
    {
      path: '/students',
      name: 'students',
      component: () => import('@/views/StudentsView.vue'),
      meta: { title: 'Students' },
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('@/views/CoursesView.vue'),
      meta: { title: 'Courses' },
    },
    {
      path: '/enrollments',
      name: 'enrollments',
      component: () => import('@/views/EnrollmentsView.vue'),
      meta: { title: 'Enrollments' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Page not found' },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

// Update the browser tab title on every page change.
router.afterEach((to) => {
  document.title = `${to.meta.title} | Student Management System`;
});

export default router;

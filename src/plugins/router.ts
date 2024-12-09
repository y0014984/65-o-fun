import { createWebHistory, createRouter } from 'vue-router';

import PageNotFound from '../views/PageNotFound.vue';
import Debug from '../views/Debug.vue';
import Live from '../views/Live.vue';

const routes = [
    { path: '/:pathMatch(.*)*', component: PageNotFound },
    { path: '/debug', component: Debug },
    { path: '/live', component: Live },
    { path: '/', redirect: '/debug' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

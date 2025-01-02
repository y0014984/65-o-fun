import { createWebHistory, createRouter } from 'vue-router';

import PageNotFound from '../views/PageNotFound.vue';
import Debug from '../views/Debug.vue';
import Live from '../views/Live.vue';
import Test from '../views/Test.vue';

const routes = [
    { path: '/65-o-fun/:pathMatch(.*)*', component: PageNotFound },
    { path: '/65-o-fun/debug', component: Debug },
    { path: '/65-o-fun/live', component: Live },
    { path: '/65-o-fun/test', component: Test },
    { path: '/65-o-fun/', redirect: '/65-o-fun/debug' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

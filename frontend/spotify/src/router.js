import { createRouter,createWebHistory } from "vue-router";

import Dashboard from './components/dashboard.vue'
import Login from './components/login.vue'


const routes = [
    {
        path:'/',
        name:'login',
        component:Login
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        beforeEnter: (to, from, next) => {
            if (!localStorage.getItem('authToken')) {
                next({ name: 'login' });
            } else {
                
                next();
            }
        }
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
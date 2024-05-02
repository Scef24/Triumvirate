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
            // Check if the user is authenticated
            if (!localStorage.getItem('authToken')) {
                // Redirect to the login page if not authenticated
                next({ name: 'login' });
            } else {
                // Proceed to the route if authenticated
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
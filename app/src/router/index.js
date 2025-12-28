import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleViewer from '../views/ArticleViewer.vue'

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/article/:encodedUrl', name: 'article', component: ArticleViewer, props: true }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
},
})

export default router

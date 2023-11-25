import Vue from 'vue';
import VueRouter from 'vue-router';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { ROUTES } from '@/router/constant';

import ErrorPage from '@/pages/ErrorPage.vue';
import MainPage from '@/pages/MainPage.vue';

const CHUNK_LOAD_REFRESH_STORAGE_KEY = 'CloudforetDevPlayground/ChunkLoadFailRefreshed';

const getCurrentTime = (): number => Math.floor(Date.now() / 1000);

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: 'history',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/',
            name: ROUTES._NAME,
            redirect: () => ({ name: ROUTES.MAIN._NAME }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'main',
                    name: ROUTES.MAIN._NAME,
                    component: MainPage,
                },
            ],
        },
        {
            path: '/error-page/:statusCode?',
            name: ROUTES.ERROR._NAME,
            props: true,
            component: ErrorPage,
        },
        {
            path: '*',
            component: ErrorPage,
        },
    ],
});

let nextPath: string;
router.onError((error) => {
    console.error(error);

    if (error.name === 'ChunkLoadError') {
        const lastCheckedTime = LocalStorageAccessor.getItem(CHUNK_LOAD_REFRESH_STORAGE_KEY);
        if (!lastCheckedTime) {
            LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, getCurrentTime().toString());
            window.location.href = nextPath ?? '/';
        } else if (getCurrentTime() - parseInt(lastCheckedTime) < 10) {
            window.location.href = nextPath ?? '/';
        }
    }
});

router.onReady(() => {
    LocalStorageAccessor.setItem(CHUNK_LOAD_REFRESH_STORAGE_KEY, '');
});


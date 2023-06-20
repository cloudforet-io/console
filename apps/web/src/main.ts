
import LottieVuePlayer from '@lottiefiles/vue-lottie-player';
import SpaceDesignSystem from '@spaceone/design-system';
import { createPinia } from 'pinia';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';
import { createApp } from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { resetStore } from '@/lib/reset-pinia-store';
import { siteInit } from '@/lib/site-initializer';

import App from './App.vue';

import '@/styles/style.pcss';
// eslint-disable-next-line
import '@spaceone/design-system/css/light-style.css';
import '@spaceone/design-system/dist/css/style.css';

/** ********** CREATE VUE APP INSTANCE ************** */
const app = createApp(App);
/* This is global injection for site-initializing */
app.provide('app', app);

const pinia = createPinia();
pinia.use(resetStore);

/** ********** SET VUE PLUGINS ************** */
app.use(pinia);
app.use(store);
const router = SpaceRouter.router;
app.use(router);
app.use(i18n);
app.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
app.use(PortalVue);
app.use(LottieVuePlayer);
app.use(SpaceDesignSystem, { vueI18n: i18n });

/** ********** INITIALIZE ************** */
(async () => {
    await siteInit();

    app.mount('#app');
})();

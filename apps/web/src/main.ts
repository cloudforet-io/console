
// import LottieVuePlayer from '@lottiefiles/vue-lottie-player';
import Notifications from '@kyvg/vue3-notification';
import SpaceDesignSystem from '@spaceone/design-system';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import { createPinia } from 'pinia';
import PortalVue from 'portal-vue';
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
import '@spaceone/design-system/dist/style.css';

/** ********** CREATE VUE APP INSTANCE ************** */
const app = createApp(App);

const pinia = createPinia();
pinia.use(resetStore);

/** ********** SET VUE PLUGINS ************** */
const router = SpaceRouter.router;
app.use(pinia);
app.use(store);
app.use(router);
app.use(i18n);
app.use(FloatingVue, { boundary: document.body });
app.use(PortalVue);
app.use(Notifications);
// app.use(LottieVuePlayer);
app.use<any>(SpaceDesignSystem, { vueI18n: i18n });

/** ********** INITIALIZE ************** */
(async () => {
    await siteInit(app);

    app.mount('#app');
})();

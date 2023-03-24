import Vue from 'vue';
import Fragment from 'vue-fragment';

import LottieVuePlayer from '@lottiefiles/vue-lottie-player';
import SpaceDesignSystem from '@spaceone/design-system';
import { PiniaVuePlugin, createPinia } from 'pinia';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';

import directive from '@/directives';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { resetStore } from '@/lib/reset-pinia-store';
import { siteInit } from '@/lib/site-initializer';

import App from './App.vue';

import '@/styles/style.pcss';
import '@spaceone/design-system/css/light-style.css';
import '@spaceone/design-system/dist/style.css';

/** ********** SET VUE PLUGINS ************** */
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);
Vue.use(PiniaVuePlugin);

directive(Vue);

Vue.use(LottieVuePlayer);
Vue.use(SpaceDesignSystem, { vueI18n: i18n });

/** ********** SET VUE CONFIG ************** */

Vue.config.productionTip = import.meta.env.DEV;

const pinia = createPinia();
pinia.use(resetStore);

/** ********** INITIALIZE ************** */
(async () => {
    await siteInit();

    new Vue({
        el: '#app',
        router: SpaceRouter.router,
        i18n,
        store,
        components: {
            App,
        },
        template: '<App/>',
        pinia,
    });
})();

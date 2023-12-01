import Vue from 'vue';
import Fragment from 'vue-fragment';

import LottieVuePlayer from '@lottiefiles/vue-lottie-player';
import SpaceDesignSystem from '@spaceone/design-system';
import { PiniaVuePlugin } from 'pinia';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';

import directive from '@/directives';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { siteInit } from '@/lib/site-initializer';
import { pinia } from '@/lib/site-initializer/pinia-store';

import App from './App.vue';

import '@/styles/style.pcss';
// eslint-disable-next-line
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

Vue.config.devtools = import.meta.env.DEV;
Vue.config.productionTip = import.meta.env.DEV;

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

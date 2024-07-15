import Vue from 'vue';
import Fragment from 'vue-fragment';

import LottieVuePlayer from '@lottiefiles/vue-lottie-player';
import { PiniaVuePlugin } from 'pinia';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';

import SpaceDesignSystem from '@cloudforet/mirinae';

import directive from '@/directives';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { pinia } from '@/store/pinia';

import { siteInit } from '@/lib/site-initializer';

import App from './App.vue';

import '@/styles/style.pcss';
// eslint-disable-next-line
import '@cloudforet/mirinae/css/light-style.css';
import '@cloudforet/mirinae/dist/style.css';


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
    await siteInit(store);

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

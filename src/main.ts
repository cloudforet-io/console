import Vue from 'vue';
import Fragment from 'vue-fragment';

import SpaceDesignSystem from '@spaceone/design-system';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';

import directive from '@/directives';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { siteInit } from '@/lib/site-initializer';

import App from './App.vue';

import '@/styles/style.pcss';
import '@spaceone/design-system/css/light-style.css';
import '@spaceone/design-system/dist/style.css';

/** ********** SET VUE PLUGINS ************** */
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);

directive(Vue);

Vue.use(SpaceDesignSystem);

/** ********** SET VUE CONFIG ************** */

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
    });
})();

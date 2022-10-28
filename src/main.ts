import Vue from 'vue';
import Fragment from 'vue-fragment';

import * as process from 'process';

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

/** ********** SET VUE PLUGINS ************** */
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);

directive(Vue);

Vue.use(SpaceDesignSystem);

Vue.config.productionTip = import.meta.env.DEV;

/** ********** WINDOW MODULES ************** */
declare global {
    interface Window {
        __APP_VER__: string;
    }
}

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

console.log('Vite Attached');
console.log('env: ', import.meta.env);
console.log('ver: ', import.meta.env.__APP_VER__);
console.log('main.ts process.env: ', process.env);

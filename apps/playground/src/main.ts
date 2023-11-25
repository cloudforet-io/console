import Vue from 'vue';
import Fragment from 'vue-fragment';

import SpaceDesignSystem from '@spaceone/design-system';
import PortalVue from 'portal-vue';

import { i18n } from '@/i18n';
import { router } from '@/router';

import App from './App.vue';

import '@/styles/style.pcss';
// eslint-disable-next-line
import '@spaceone/design-system/css/light-style.css';
import '@spaceone/design-system/dist/style.css';

/** ********** SET VUE PLUGINS ************** */
Vue.use(Fragment.Plugin);
Vue.use(PortalVue);

Vue.use(SpaceDesignSystem, { vueI18n: i18n });

/** ********** SET VUE CONFIG ************** */

Vue.config.devtools = import.meta.env.DEV;
Vue.config.productionTip = import.meta.env.DEV;


/** ********** INITIALIZE ************** */
new Vue({
    el: '#app',
    router,
    i18n,
    components: {
        App,
    },
    template: '<App/>',
});

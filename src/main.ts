import VueCompositionApi from '@vue/composition-api';

import SpaceDesignSystem from '@spaceone/design-system';
import PortalVue from 'portal-vue';
import VTooltip from 'v-tooltip';
import Vue from 'vue';
import Fragment from 'vue-fragment';

import directive from '@/directives';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';


import { siteInit } from '@/lib/site-initializer';

import ErrorHandler from '@/common/composables/error/errorHandler';

import App from './App.vue';

import '@/styles/style.pcss';
import '@spaceone/design-system/css/light-style.css';


/** ********** SET VUE PLUGINS ************** */
Vue.use(VueCompositionApi);
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);

directive(Vue);

Vue.use(SpaceDesignSystem);

Vue.config.errorHandler = error => ErrorHandler.handleError(error);

(async () => {
    ErrorHandler.init({
        authenticationErrorHandler: () => {
            store.dispatch('error/showSessionExpiredError');
            store.dispatch('user/setIsSessionExpired', true);
        },
        authorizationErrorHandler: () => {
            store.dispatch('error/showAuthorizationError');
        },
    });

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

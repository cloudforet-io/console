// import 'core-js/es6/promise'
// import 'core-js/es6/string'
// import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App';
import router from './router';
import { i18n } from '@/setup/i18n';
import { api } from '@/setup/api';
import { Mixin } from '@/setup/global_util';
import store from './store';
import dotenv from 'dotenv';
import VueCookie from 'vue-cookie';
import directive from '@/directive';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlert from '@vuejs-pt/vue-alert';
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import CountryFlag from 'vue-country-flag';
import { $, jQuery } from 'jquery';
import VueAlertify from 'vue-alertify';

// TODO: Please get rid of items that won't be used in following environments: DEV, STG, PROD
// cssVars()
dotenv.config();
Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueCookie);
Vue.use(VueAlert);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(CountryFlag);
Vue.use(Notifications, { velocity });
Vue.use({ $, jQuery }),
Vue.prototype.$http = api;

/* This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 */
Vue.prototype.$bus = new Vue({});
directive(Vue);

new Vue({
    el: '#app',
    router,
    i18n,
    api,
    store,
    components: {
        App
    },
    template: '<App/>'
});

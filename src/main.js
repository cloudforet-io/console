import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App';
import router from '@/routes/index';
import store from './store';
import dotenv from 'dotenv';
import directive from '@/directives';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import CountryFlag from 'vue-country-flag';
import { i18n } from '@/setup/i18n';
import { api } from '@/setup/api';
import { Mixin } from '@/setup/global_util';
import VueLodash from 'vue-lodash';
import url from 'url';
import timezone from 'countries-and-timezones';
import GAuth from 'vue-google-oauth2';
//TODO: Please get rid of items that won't be used in following environments: DEV, STG, PROD
dotenv.config();
const gauthOption = {
    client_id: '150323145707-hp5i8q4hm1vcb2hpta23c1829167nl1h.apps.googleusercontent.com',
    fetch_basic_profile: false,
    prompt: 'select_account'
};
Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(CountryFlag);
Vue.use(Notifications, { velocity });
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(GAuth, gauthOption);
Vue.prototype.$axios = api;
Vue.prototype.$velocity = velocity;
Vue.prototype.$timezone = timezone;

let domain = url.parse(window.location.origin);

/*****************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 *****************************************************************/
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
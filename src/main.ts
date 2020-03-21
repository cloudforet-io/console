import Vue from 'vue';
import VueCookies from 'vue-cookies';
import BootstrapVue from 'bootstrap-vue';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import LiquorTree from 'liquor-tree';
import router from '@/routes/index';
import store from '@/store';
import directive from '@/directives';
import { i18n } from '@/translations';
import { Util } from '@/lib/global-util';
import LocalStorageStore from '@/store/toolset';
import App from './App.vue';
import '@/styles/style.scss';

Vue.mixin(Util);
Vue.use(VueCookies);
Vue.use(VueCompositionApi);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(Notifications, { velocity });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i',
});

Vue.use(LiquorTree);

Vue.prototype.$velocity = velocity;

/** ***************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 **************************************************************** */

Vue.prototype.$bus = new Vue({});
Vue.prototype.$ls = new Vue(LocalStorageStore);
directive(Vue);

new Vue({
    el: '#app',
    router,
    i18n,
    store,
    components: {
        App,
    },
    template: '<App/>',
});
export default Vue;

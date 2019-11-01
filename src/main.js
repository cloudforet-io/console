import Vue from 'vue';
import { mapGetters } from 'vuex';
import BootstrapVue from 'bootstrap-vue';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import VueLodash from 'vue-lodash';
import App from './App';
import router from '@/routes/index';
import store from './store';
import directive from '@/directives';
import { i18n } from '@/translations';
import { Mixin } from '@/mixins/global-util';

Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(VueLodash, { name: 'lodash' });

Vue.prototype.$velocity = velocity;

/** ***************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 **************************************************************** */
Vue.prototype.$bus = new Vue({});
directive(Vue);

new Vue({
    el: '#app',
    router,
    i18n,
    store,
    async created() {
        await store.dispatch('loadConfig');
        store.dispatch('domain/sync');
        if (!store.getters['domain/id']) {
            await store.dispatch('domain/load');
        }

        const next = window.location.pathname + window.location.search;
    },
    components: {
        App,
    },
    template: '<App/>',
});

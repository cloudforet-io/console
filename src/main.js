import Vue from 'vue';
import VueCookies from 'vue-cookies';
import BootstrapVue from 'bootstrap-vue';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import VueLodash from 'vue-lodash';
import SvgIcon from 'vue-svgicon';
import App from './App';
import router from '@/routes/index';
import store from './store';
import directive from '@/directives';
import { i18n } from '@/translations';
import { Mixin } from '@/mixins/global-util';
import config from '@/lib/config';
import api from '@/lib/api';

Vue.mixin(Mixin);
Vue.use(VueCookies);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i',
});

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
        await config.init();
        api.init(config.get('VUE_APP_API.ENDPOINT'), {
            authError: (error) => {
                store.dispatch('auth2/signOut');
                // TODO: show popup (re-sign-in)
                // router.push({ path: '/sign-in' }); -> before logic
            },
        });
        Vue.prototype.$http = api.instance;
        Vue.prototype.$axios = api.instance;

        store.dispatch('domain/sync');
        if (!store.getters['domain/id']) {
            try {
                await store.dispatch('domain/load');
            } catch (e) {
                // TODO: this.$router.push('/error-page');
                // status : e.status
                // message : e.message
            }
        }

        store.dispatch('auth2/sync');

        // TODO: sign in process
        // try {
        //     await store.dispatch('auth2/signIn', {
        //         user_id: 'admin',
        //         password: 'admin',
        //     });
        // } catch (e) {
        //     show notification (e.message)
        //     store.dispatch('auth2/signOut');
        // }
    },
    components: {
        App,
    },
    template: '<App/>',
});

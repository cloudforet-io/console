import Vue from 'vue';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import LiquorTree from 'liquor-tree';
import router from '@/routes/index';
import { store } from '@/store';
import directive from '@/directives';
import { i18n } from '@/translations';
import setStore, { useStore } from '@/store/toolset';
import webFontLoader from 'webfontloader';
import { webFonts, fontUrls } from '@/styles/web-fonts';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import Codemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import '@/styles/style.pcss';
import config from '@/lib/config';
import { SpaceConnector } from '@/lib/space-connector';
import { api } from '@/lib/api/axios';
import { GTag, setGtagUserID } from '@/lib/gtag';
import App from './App.vue';


/** ********** SET VUE PLUGINS ************** */
Vue.use(VueCompositionApi);
Vue.use(Notifications, { velocity });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i',
});
Vue.use(LiquorTree);
// @ts-ignore
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(Codemirror);

Vue.prototype.$velocity = velocity;

webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});

directive(Vue);


/** ********** INIT ************** */

const initConfig = async () => {
    await config.init();
    await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        // Add session expiration process
    });
    Vue.prototype.$http = api.init(config.get('VUE_APP_API.ENDPOINT'));
};

const initDomain = async () => {
    let domainName;
    if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        const { hostname } = window.location;
        domainName = hostname.split('.')[0];
    } else {
        domainName = config.get('DOMAIN_NAME');
    }
    await store.dispatch('domain/load', domainName);
};

const initGtag = () => {
    if (config.get('GTAG_ID')) new GTag(config.get('GTAG_ID'), Vue, router);
    setGtagUserID(Vue.prototype, store);
};

const initLanguage = () => {
    store.watch(state => state.user.language, (lang) => {
        i18n.locale = lang as string;
    }, { immediate: true });
};


(async () => {
    try {
        await initConfig();
        await initDomain();
        initGtag();
        initLanguage();
    } catch (e) {
        console.error(e);
    }

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
})();
//
// new Vue({
//     el: '#app',
//     router,
//     i18n,
//     store,
//     components: {
//         App,
//     },
//     template: '<App/>',
// });

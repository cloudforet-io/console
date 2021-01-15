import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import router from '@/routes/index';
import { store } from '@/store';
import directive from '@/directives';
import { i18n } from '@/translations';
import webFontLoader from 'webfontloader';
import { webFonts, fontUrls } from '@/styles/web-fonts';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import '@/styles/style.pcss';
import config from '@/lib/config';
import { SpaceConnector } from '@/lib/space-connector';
import { GTag, setGtagUserID } from '@/lib/gtag';
import SpaceDesignSystem from '@spaceone/design-system';
import App from './App.vue';


/** ********** SET VUE PLUGINS ************** */
Vue.use(VueCompositionApi);
// @ts-ignore
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });


directive(Vue);

Vue.use(SpaceDesignSystem);


/** ********** INIT ************** */
webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});

const initConfig = async () => {
    await config.init();
};

const initApiClient = async () => {
    await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        // Add session expiration process
        store.dispatch('user/setIsSessionExpired', true);
    });
}

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
    setGtagUserID(Vue.prototype);
};

const initLanguage = () => {
    store.watch(state => state.user.language, (lang) => {
        i18n.locale = lang as string;
    }, { immediate: true });
};


(async () => {
    try {
        await initConfig();
        await initApiClient();
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

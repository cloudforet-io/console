import Vue from 'vue';
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
import setStore from '@/store/toolset';
import webFontLoader from 'webfontloader';
import { webFonts, fontUrls } from '@/styles/web-fonts';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import Codemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import App from './App.vue';
import '@/styles/style.scss';
import '@/styles/style.pcss';


Vue.mixin(Util);
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

/** ***************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 **************************************************************** */

Vue.prototype.$bus = new Vue({});
Vue.prototype.$ls = setStore();

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

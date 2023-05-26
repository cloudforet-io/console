declare module '*.vue' {
    import Vue from 'vue';

    import { VTooltip } from 'v-tooltip';
    import { Fragment } from 'vue-fragment';
    import VueI18n from 'vue-i18n';
    import Notifications from 'vue-notification';
    import SvgIcon from 'vue-svgicon';

    Vue.use(VueI18n);
    Vue.use(Fragment.Plugin);
    Vue.use(Notifications);
    Vue.use(SvgIcon);
    Vue.use(VTooltip);

    export default Vue;
}

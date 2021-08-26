declare module '*.vue' {
    import Vue from 'vue';
    import VueRouter from 'vue-router';
    import VueI18n from 'vue-i18n';
    import VueCompositionApi from '@vue/composition-api';
    import { Fragment } from 'vue-fragment';
    import Notifications from 'vue-notification';
    import SvgIcon from 'vue-svgicon';
    import { VTooltip } from 'v-tooltip';

    Vue.use(VueRouter);
    Vue.use(VueI18n);
    Vue.use(VueCompositionApi);
    Vue.use(Fragment.Plugin);
    Vue.use(Notifications);
    Vue.use(SvgIcon);
    Vue.use(VTooltip);

    export default Vue;
}

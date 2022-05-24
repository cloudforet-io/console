declare module '*.vue' {
    import VueCompositionApi from '@vue/composition-api';
    import Vue from 'vue';

    import { VTooltip } from 'v-tooltip';
    import { Fragment } from 'vue-fragment';
    import VueI18n from 'vue-i18n';
    import Notifications from 'vue-notification';
    import VueRouter from 'vue-router';
    import SvgIcon from 'vue-svgicon';

    Vue.use(VueRouter);
    Vue.use(VueI18n);
    Vue.use(VueCompositionApi);
    Vue.use(Fragment.Plugin);
    Vue.use(Notifications);
    Vue.use(SvgIcon);
    Vue.use(VTooltip);

    export default Vue;
}

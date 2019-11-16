import {configure, addParameters, addDecorator} from '@storybook/vue';
import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport';
import {withA11y} from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import { withCssResources } from '@storybook/addon-cssresources';
import '@storybook/addon-console';
import "@/styles/style.scss";
import { withInfo } from 'storybook-addon-vue-info'
// main.js
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import directive from '@/directives';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import { Util } from '@/lib/global-util';
import VueLodash from 'vue-lodash';
import { withKnobs } from '@storybook/addon-knobs';
import SvgIcon from 'vue-svgicon';
import { i18n } from '@/translations';
import VueI18n from 'vue-i18n';

Vue.use(VueCompositionApi);
Vue.use(VueI18n);
Vue.mixin(Util);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueI18n);
Vue.use(VueInputAutowidth);
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})

Vue.prototype.$velocity = velocity;

/*****************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 *****************************************************************/
Vue.prototype.$bus = new Vue({});
directive(Vue);

// automatically import all files ending in *stories.js
configure(require.context('../src', true, /\.stories\.js$/), module);
configure(require.context('../stories', true, /\.stories\.js$/), module);
addDecorator(withInfo);
addDecorator(withA11y);
addDecorator(withKnobs);
addDecorator(centered);
addDecorator(withCssResources);
addDecorator(() => ({
    template: '<story/>',
    i18n,
}));
addParameters({
    viewport: {
        viewports: INITIAL_VIEWPORTS,
    },

});

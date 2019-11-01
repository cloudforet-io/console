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
import { Mixin } from '@/mixins/global-util';
import VueLodash from 'vue-lodash';
import VueI18n from 'vue-i18n';
import { withKnobs } from '@storybook/addon-knobs';

Vue.mixin(Mixin);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueI18n);
Vue.use(VueInputAutowidth);
Vue.use(VueLodash, { name: 'lodash' });

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
addParameters({
    viewport: {
        viewports: INITIAL_VIEWPORTS,
    },

});

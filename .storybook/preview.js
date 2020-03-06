import {configure, addParameters, addDecorator} from '@storybook/vue';
import {withA11y} from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import '@storybook/addon-console';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import store from '@/store';
import directive from '@/directives';
import VueInputAutowidth from 'vue-input-autowidth';
import VueAlertify from 'vue-alertify';
import velocity from 'velocity-animate';
import { Util } from '@/lib/global-util';
import VueLodash from 'vue-lodash';
import { withKnobs } from '@storybook/addon-knobs';
import SvgIcon from 'vue-svgicon';
import { i18n } from '@/translations';
import LiquorTree from 'liquor-tree';
import "@/styles/style.scss";

Vue.use(Notifications, { velocity });
Vue.use(VueCompositionApi);
Vue.mixin(Util);
Vue.use(BootstrapVue);
Vue.use(VueAlertify);
Vue.use(VueInputAutowidth);
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})
Vue.use(LiquorTree);

Vue.prototype.$velocity = velocity;

/*****************************************************************
 * This is a Global Bus Event;
 * Please, name your '$emit' event name as action + Event such as
 * nodeSelectedEvent, closeModalEvent
 *****************************************************************/
Vue.prototype.$bus = new Vue({});
directive(Vue);

addParameters({
    docs: {
        extractComponentDescription: (component, { notes }) => {
            if (notes) {
                return typeof notes === 'string' ? notes : notes.markdown || notes.text;
            }
            return null;
        },
    },
});
addDecorator(withA11y);
addDecorator(withKnobs);
addDecorator(centered);
addDecorator(() => ({
    i18n,
    store,
    template: '<story/>',
}));

import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PluginFilter from './PluginFilter';


export default {
    title: 'view/inventory/collector/collector-plugins/PluginFilter',
    component: PluginFilter,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PluginFilter },
    props: {
        ...autoProps(PluginFilter),
    },
    template: `<PluginFilter style="border: 1px solid gray;" v-bind="$props"
                    @goBack="goBack"
                    @search="search"
                    @repoChange="repoChange"
                    @resourceChange="resourceChange"
                />`,
    setup() {
        return {
            goBack: action('goBack'),
            search: action('search'),
            repoChange: action('repoChange'),
            resourceChange: action('resourceChange'),
        };
    },
});

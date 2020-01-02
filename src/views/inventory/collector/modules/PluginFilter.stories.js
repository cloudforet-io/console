import { withKnobs, object } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PluginFilter from './PluginFilter';
import { filterBadgeList } from '@/components/molecules/badges/filter-badge/FilterBadge';

export default {
    title: 'view/inventory/collector/modules/PluginFilter',
    component: PluginFilter,
    decorators: [withKnobs],
};


const setFilters = (props, context, listState) => {
    const filterTools = filterBadgeList();

    return {
        filterTools,
    };
};


export const defaultCase = () => ({
    components: { PluginFilter },
    template: `<PluginFilter style="border: 1px solid gray;"
                    :filters.sync="filterTools.filters"
                    @goBack="goBack"
                    @search="search"
                    @repoChange="repoChange"
                    @resourceChange="resourceChange"
                />`,
    setup() {
        return {
            ...setFilters(),
            goBack: action('goBack'),
            search: action('search'),
            repoChange: action('repoChange'),
            resourceChange: action('resourceChange'),
        };
    },
});

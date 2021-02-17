<template>
    <fragment>
        <p-breadcrumbs :routes="routeState.route" />
        <div class="page-title">
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP')" use-total-count :total-count="totalCount" />
            <router-link :to="{ name: 'addSpotGroup' }">
                <p-icon-text-button style-type="primary-dark" outline name="ic_plus_bold"
                                    class="add-spot-group-btn"
                >
                    {{$t('AUTOMATION.SPOT_AUTOMATION.SPOT_GROUP_LIST.ADD_SPOT_GROUP')}}
                </p-icon-text-button>
            </router-link>
        </div>
        <p-divider class="spot-group-divider" />
        <p-toolbox filters-visible
                   search-type="query"
                   :page-size.sync="pageSize"
                   :total-count="totalCount"
                   :query-tags="tags"
                   :key-item-sets="keyItemSets"
                   :value-handler-map="valueHandlerMap"
                   @change="onChange"
                   @refresh="onChange"
        />
    </fragment>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    PBreadcrumbs, PPageTitle, PDivider, PToolbox, PIconTextButton,
} from '@spaceone/design-system';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { QueryHelper } from '@/lib/query';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { getThisPage } from '@/lib/component-utils/pagination';

// TODO: change handlers with spot automation spec
const handlers = makeQuerySearchPropsWithSearchSchema(
    [{
        title: 'Filters',
        items: [
            { key: 'cloud_service_type', name: 'Cloud Service Type' },
            { key: 'cloud_service_group', name: 'Cloud Service Group' },
            { key: 'project_id', name: 'Project', reference: 'identity.Project' },
            { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
            { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
        ],
    }],
    'inventory.CloudService',
);


export default {
    name: 'SpotGroupPage',
    components: {
        PBreadcrumbs,
        PPageTitle,
        PDivider,
        PToolbox,
        PIconTextButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        const state = reactive({
            items: undefined as unknown,
            loading: true,
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION'), path: '/automation/spot-automation/spot-group' },
            ]),
        });

        const listSpotGroup = () => {
            // TODO: add list spot group api
        };

        const changeQueryString = async (options) => {
            queryHelper.setFiltersAsQueryTag(options.queryTags);
            await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        };

        const onChange = async (options: any) => {
            if (options.queryTags !== undefined) {
                state.tags = options.queryTags;
                await changeQueryString(options);
            }
            if (options.limit !== undefined) {
                state.pageSize = options.limit;
            }
            if (options.start !== undefined) {
                state.thisPage = getThisPage(options.start, state.pageSize);
            }
            await listSpotGroup();
        };

        return {
            ...toRefs(state),
            routeState,
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.page-title {
    display: flex;
    justify-content: space-between;
}

.spot-group-divider {
    @apply w-full;
    margin-bottom: 1.5rem;
}
</style>

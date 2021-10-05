<template>
    <div>
        <project-member-tab :project-id="id" :filters="filters" @update-filters="onUpdateFilters" />
    </div>
</template>

<script lang="ts">
import ProjectMemberTab from '@/services/project/project-detail/project-member/modules/ProjectMemberTab.vue';
import {
    ComponentRenderProxy, getCurrentInstance, onActivated, reactive, toRefs,
} from '@vue/composition-api';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { replaceUrlQuery } from '@/lib/router-query-string';

export default {
    name: 'ProjectMemberPage',
    components: { ProjectMemberTab },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            filters: queryHelper.filters,
        });

        const onUpdateFilters = (filters) => {
            state.filters = filters;
            queryHelper.setFilters(filters);
            replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        };

        onActivated(() => {
            replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        });

        return {
            ...toRefs(state),
            onUpdateFilters,
        };
    },
};
</script>

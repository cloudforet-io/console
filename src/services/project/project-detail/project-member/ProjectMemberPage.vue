<template>
    <div>
        <project-member-tab :project-id="id"
                            :filters="filters"
                            :manage-disabled="!hasManagePermission"
                            @update-filters="onUpdateFilters"
        />
    </div>
</template>

<script lang="ts">
import {
    getCurrentInstance, onActivated, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import ProjectMemberTab from '@/services/project/project-detail/project-member/modules/ProjectMemberTab.vue';

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
        const vm = getCurrentInstance()?.proxy as Vue;

        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            filters: queryHelper.filters,
            hasManagePermission: useManagePermissionState(),
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

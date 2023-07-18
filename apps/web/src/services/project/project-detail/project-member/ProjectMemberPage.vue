<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    onActivated, reactive,
} from 'vue';
import { useRoute } from 'vue-router';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import ProjectMemberTab from '@/services/project/project-detail/project-member/modules/ProjectMemberTab.vue';

interface Props {
    id: string;
}

defineProps<Props>();
const route = useRoute();

const queryHelper = new QueryHelper().setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]);
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

</script>

<template>
    <div>
        <project-member-tab :project-id="id"
                            :filters="state.filters"
                            :manage-disabled="!state.hasManagePermission"
                            @update-filters="onUpdateFilters"
        />
    </div>
</template>


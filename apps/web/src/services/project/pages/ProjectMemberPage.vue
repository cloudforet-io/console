<script lang="ts" setup>
import {
    onActivated, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ProjectMemberTab from '@/services/project/components/ProjectMemberTab.vue';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();

const queryHelper = new QueryHelper().setFiltersAsRawQueryString(route.query.filters);
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
</script>

<template>
    <div>
        <project-member-tab :project-id="props.id"
                            :filters="state.filters"
                            @update-filters="onUpdateFilters"
        />
    </div>
</template>

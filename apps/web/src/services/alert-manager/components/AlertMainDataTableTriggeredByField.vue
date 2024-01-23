<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { Location } from 'vue-router';

import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';


import { QueryHelper } from '@cloudforet/core-lib/query';

import type { ReferenceItem } from '@/store/modules/reference/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const props = defineProps<{
    value?: string;
    projectId?: string;
    disableLink?: boolean;
    webhookReference?: ReferenceItem;
    userReference?: ReferenceItem;
}>();

const queryHelper = new QueryHelper();
const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    webhookLabel: computed<string|undefined>(() => props.webhookReference?.label),
    userLabel: computed<string|undefined>(() => props.userReference?.label),
    label: computed(() => state.webhookLabel || state.userLabel || props.value),
    link: computed<Location|undefined>(() => {
        if (props.disableLink) return undefined;
        if (props.webhookReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                params: {
                    id: props.projectId ?? '',
                },
                query: {
                    filters: queryHelper.setFilters([{ k: 'webhook_id', v: props.value ?? '', o: '=' }]).rawQueryStrings,
                },
            };
        } if (state.userReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                params: {
                    id: props.projectId ?? '',
                },
                query: {
                    filters: queryHelper.setFilters([{ v: props.value ?? '' }]).rawQueryStrings,
                },
            };
        }
        return undefined;
    }),
});
</script>

<template>
    <span>
        <p-link v-if="state.link"
                :action-icon="ACTION_ICON.INTERNAL_LINK"
                new-tab
                :to="getProperRouteLocation(state.link)"
        >
            {{ state.label }}
        </p-link>
        <template v-else>
            {{ state.label }}
        </template>
    </span>
</template>

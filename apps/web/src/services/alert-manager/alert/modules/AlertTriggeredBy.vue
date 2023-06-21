<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import { PAnchor } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import type { RouteLocation } from 'vue-router';



import type { ReferenceItem } from '@/store/modules/reference/type';

import { PROJECT_ROUTE } from '@/services/project/route-config';

interface Props {
    value: string;
    projectId: string;
    disableLink: boolean;
    webhookReference?: ReferenceItem;
    userReference?: ReferenceItem;
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    projectId: '',
    disableLink: false,
    webhookReference: undefined,
    userReference: undefined,
});

const queryHelper = new QueryHelper();

const state = reactive({
    webhookLabel: computed<string|undefined>(() => props.webhookReference?.label),
    userLabel: computed<string|undefined>(() => props.userReference?.label),
    label: computed(() => state.webhookLabel || state.userLabel || props.value),
    link: computed<RouteLocation|undefined>(() => {
        if (props.disableLink) return undefined;
        if (props.webhookReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                params: {
                    id: props.projectId,
                } as RouteLocation['params'],
                query: {
                    filters: queryHelper.setFilters([{ k: 'webhook_id', v: props.value, o: '=' }]).rawQueryStrings,
                } as RouteLocation['query'],
            } as RouteLocation;
        } if (state.userReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                params: {
                    id: props.projectId,
                } as RouteLocation['params'],
                query: {
                    filters: queryHelper.setFilters([{ v: props.value }]).rawQueryStrings,
                } as RouteLocation['query'],
            } as RouteLocation;
        }
        return undefined;
    }),
});

</script>

<template>
    <span>
        <p-anchor v-if="state.link"
                  :to="state.link"
        >
            {{ state.label }}
        </p-anchor>
        <template v-else>
            {{ state.label }}
        </template>
    </span>
</template>

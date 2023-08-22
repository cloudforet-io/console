<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import {
    computed, reactive,
} from 'vue';
import type { RouteLocationRaw } from 'vue-router';



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
    link: computed<RouteLocationRaw|undefined>(() => {
        if (props.disableLink) return undefined;
        if (props.webhookReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                params: {
                    id: props.projectId,
                },
                query: {
                    filters: queryHelper.setFilters([{ k: 'webhook_id', v: props.value, o: '=' }]).rawQueryStrings,
                },
            };
        } if (state.userReference) {
            return {
                name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                params: {
                    id: props.projectId,
                },
                query: {
                    filters: queryHelper.setFilters([{ v: props.value }]).rawQueryStrings,
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
                :to="state.link"
        >
            {{ state.label }}
        </p-link>
        <template v-else>
            {{ state.label }}
        </template>
    </span>
</template>

<template>
    <p-list-card class="project-alert-list-item"
                 :items="items"
                 :loading="loading"
    >
        <template #header>
            {{ $t('MONITORING.ALERT.DASHBOARD.OPEN_ALERT') }} ({{ totalCount > 15 ? '15+' : totalCount }})
        </template>
        <template #item="{item, index}">
            <alert-list-item v-if="index < 15"
                             :item="item"
                             :show-status-message="true"
                             :user-reference="users[item.assignee]"
            />
            <div v-else
                 class="view-all-text"
            >
                <p-link :to="{ name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME, params: { id: projectId } }"
                        :text="$t('MONITORING.ALERT.DASHBOARD.VIEW_ALL_OPEN_ALERTS')"
                        hide-icon
                        highlight
                />
            </div>
        </template>
    </p-list-card>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PListCard, PLink,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import AlertListItem from '@/services/alert-manager/modules/AlertListItem.vue';
import { PROJECT_ROUTE } from '@/services/project/route-config';

export default {
    name: 'ProjectAlertListItem',
    components: {
        PListCard,
        PLink,
        AlertListItem,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            items: [],
            totalCount: 0,
        });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery
                .setSort('created_at', true)
                .setPage(1, 16)
                .setFilters([{ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' }]);
            return apiQuery.data;
        };
        const listAlerts = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    project_id: props.projectId,
                    query: getQuery(),
                });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/user/load'),
            ]);
        })();

        watch(() => props.projectId, async (projectId) => {
            if (projectId) await listAlerts();
        }, { immediate: true });

        return {
            ...toRefs(state),
            PROJECT_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-list-card */
.p-list-card {
    :deep(.body) {
        overflow-y: auto;

        .view-all-text {
            text-align: center;
        }
    }
}

</style>

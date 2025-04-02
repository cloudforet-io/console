<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import { find } from 'lodash';

import { getAllPage, getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PListCard, PSelectButton, PTextPagination,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/monitoring/alert/api-verbs/list';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { alert, secondary } from '@/styles/colors';

import AlertListItem from '@/services/alert-manager/v1/components/AlertListItem.vue';
import { ALERT_ASSIGNED_FILTER } from '@/services/alert-manager/v1/constants/alert-constant';
import type { AlertListPageUrlQuery } from '@/services/alert-manager/v1/types/alert-type';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

interface AlertState {
    name: string;
    label: TranslateResult;
    color?: string;
}
interface Props {
    projectId: string;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: '',
});

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const state = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    alertStates: computed<AlertState[]>(() => ([
        {
            name: ALERT_STATE.TRIGGERED,
            label: i18n.t('PROJECT.DETAIL.SUMMARY.TRIGGERED'),
            color: alert,
        },
        {
            name: ALERT_STATE.ACKNOWLEDGED,
            label: i18n.t('PROJECT.DETAIL.SUMMARY.ACKNOWLEDGED'),
            color: secondary,
        },
        {
            name: ALERT_STATE.RESOLVED,
            label: i18n.t('PROJECT.DETAIL.SUMMARY.RESOLVED'),
        },
    ])),
    alertStateCounts: [],
    counts: computed(() => ({
        TRIGGERED: find(state.alertStateCounts, { state: ALERT_STATE.TRIGGERED })?.total || 0,
        ACKNOWLEDGED: find(state.alertStateCounts, { state: ALERT_STATE.ACKNOWLEDGED })?.total || 0,
        RESOLVED: find(state.alertStateCounts, { state: ALERT_STATE.RESOLVED })?.total || 0,
    })),
    //
    loading: true,
    assignedStateList: computed(() => [
        {
            name: ALERT_ASSIGNED_FILTER.ALL,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL'),
        },
        {
            name: ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME'),
        },
    ]),
    selectedAssignedState: ALERT_ASSIGNED_FILTER.ALL,
    items: [] as AlertModelV1[],
    totalCount: 0,
    thisPage: 1,
    allPage: 1,
    pageSize: 10,
});

/* util */
const alertLinkFormatter = (alertState): Location => ({
    name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME,
    query: {
        state: alertState,
    } as AlertListPageUrlQuery,
});

/* api */
const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery
        .setSort('created_at', true)
        .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
    if (state.selectedAssignedState === ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME) {
        apiQuery.setFilters([{ k: 'assignee', v: userStore.state.userId || '', o: '=' }]);
    } else {
        apiQuery.setFilters([
            { k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' },
        ]);
    }
    return apiQuery.data;
};
const listAlerts = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.clientV2.monitoring.alert.list<AlertListParameters, ListResponse<AlertModelV1>>({
            project_id: props.projectId,
            query: getQuery(),
        });
        state.totalCount = total_count ?? 0;
        state.allPage = getAllPage(total_count, 10);
        state.items = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const statAlerts = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
            project_id: props.projectId,
        });
        state.alertStateCounts = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.alertStateCounts = 0;
    }
};

watch(() => props.projectId, async (projectId) => {
    if (projectId) {
        await Promise.all([statAlerts(), listAlerts()]);
    }
}, { immediate: true });
</script>

<template>
    <div>
        <div class="title">
            <span>{{ $t('PROJECT.DETAIL.SUMMARY.ALERT') }}</span>
        </div>
        <div class="content-wrapper">
            <div class="button-group">
                <router-link v-for="(alertState, idx) in state.alertStates"
                             :key="`button-${idx}`"
                             :to="alertLinkFormatter(alertState.name)"
                             class="button"
                             :style="{ color: alertState.color }"
                >
                    <strong>{{ numberFormatter(state.counts[alertState.name]) }}</strong> {{ alertState.label }}
                </router-link>
            </div>
            <p-list-card :items="state.items"
                         :loading="state.loading"
                         :hoverable="true"
            >
                <template #header>
                    <p class="left-part">
                        <strong>{{ $t('PROJECT.DETAIL.SUMMARY.OPEN_ALERT') }}</strong> ({{ numberFormatter(state.totalCount) }})
                    </p>
                    <p class="right-part">
                        <p-select-button v-for="(assignedState, idx) in state.assignedStateList"
                                         :key="`assigned-${idx}`"
                                         v-model="state.selectedAssignedState"
                                         class="assigned-button"
                                         :value="assignedState.name"
                                         size="sm"
                                         style-type="gray"
                                         @change="listAlerts"
                        >
                            {{ assignedState.label }}
                        </p-select-button>
                        <p-text-pagination
                            :this-page.sync="state.thisPage"
                            :all-page="state.allPage"
                            :show-page-number="false"
                            @pageChange="listAlerts"
                        />
                    </p>
                </template>
                <template #item="{item}">
                    <alert-list-item
                        :item="item"
                        :show-member-name="true"
                        :user-reference="state.users[item.assignee]"
                    />
                </template>
            </p-list-card>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.title {
    font-size: 1.5rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
}
.content-wrapper {
    .button-group {
        display: flex;
        justify-content: space-around;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .button {
            @apply border border-gray-200 rounded-md;
            width: 100%;
            height: 3rem;
            text-align: left;
            font-size: 1rem;
            line-height: 1.5;
            padding: 0.625rem 1rem;
            &:hover {
                @apply bg-secondary2;
            }
        }
    }

    /* custom design-system component - p-list-card */
    :deep(.p-list-card) {
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .left-part {
                @apply text-gray-900;
                font-size: 0.875rem;
                line-height: 1.5;
            }
            .right-part {
                height: 1.5rem;
                display: flex;
                gap: 0.25rem;
            }
        }
        .body {
            height: 17rem;
            overflow-y: auto;
            .p-data-loader {
                height: 100%;
            }
        }
    }
}

@screen tablet {
    .content-wrapper {
        /* custom design-system component - p-list-card */
        :deep(.p-list-card) {
            header {
                .assigned-button {
                    display: none;
                }
            }
        }
    }
}

@screen mobile {
    .content-wrapper {
        .button-group {
            display: grid;
            justify-content: stretch;
        }
    }
}
</style>

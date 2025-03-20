<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { find, sum } from 'lodash';

import { getAllPage, getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBalloonTab, PListCard, PSelectStatus, PTextPagination, PSelectButton, PCheckbox, PIconButton,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/monitoring/alert/api-verbs/list';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import AlertListItem from '@/services/alert-manager/v1/components/AlertListItem.vue';
import { ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER } from '@/services/alert-manager/v1/constants/alert-constant';


const TAB_STATE = Object.freeze({
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
});

const props = defineProps<{
    activatedProjects: string[];
}>();
const tabState = reactive({
    tabs: computed(() => ([
        {
            name: TAB_STATE.OPEN,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.OPEN'),
        },
        {
            name: TAB_STATE.RESOLVED,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.RESOLVED'),
        },
        {
            name: TAB_STATE.ALL,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL_STATE'),
        },
    ])),
    activeTab: TAB_STATE.OPEN,
    tabItems: {
        OPEN: {
            count: 0,
            styleType: 'alert',
        },
        RESOLVED: {
            count: 0,
            styleType: 'gray',
        },
        ALL: {
            count: 0,
            styleType: 'primary',
        },
    },
});
const userStore = useUserStore();
const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const state = reactive({
    loading: true,
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    urgencyList: computed(() => ([
        {
            name: ALERT_URGENCY_FILTER.ALL,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL_URGENCY'),
        },
        {
            name: ALERT_URGENCY_FILTER.HIGH,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.HIGH'),
            icon: 'ic_error-filled',
        },
        {
            name: ALERT_URGENCY_FILTER.LOW,
            label: i18n.t('MONITORING.ALERT.DASHBOARD.LOW'),
            icon: 'ic_warning-filled',
        },
    ])),
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
    //
    selectedUrgency: ALERT_URGENCY_FILTER.ALL,
    selectedAssignedState: ALERT_ASSIGNED_FILTER.ALL,
    isAssignedToMe: false,
    items: [] as AlertModelV1[],
    thisPage: 1,
    allPage: 1,
    pageSize: 10,
});

/* api */
const getQuery = () => {
    const apiQuery = new ApiQueryHelper();
    apiQuery
        .setSort('created_at', true)
        .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);

    const filters: ConsoleFilter[] = [];
    filters.push({ k: 'project_id', v: props.activatedProjects, o: '' });
    if (state.selectedUrgency !== ALERT_URGENCY_FILTER.ALL) {
        filters.push({ k: 'urgency', v: state.selectedUrgency, o: '=' });
    }
    if (tabState.activeTab === TAB_STATE.OPEN) {
        filters.push({ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' });
    } else if (tabState.activeTab === TAB_STATE.RESOLVED) {
        filters.push({ k: 'state', v: ALERT_STATE.RESOLVED, o: '=' });
    }
    if (state.isAssignedToMe) {
        filters.push({ k: 'assignee', v: userStore.state.userId || '', o: '=' });
    }
    apiQuery.setFilters(filters);
    return apiQuery.data;
};
const listAlerts = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.clientV2.monitoring.alert.list<AlertListParameters, ListResponse<AlertModelV1>>({
            query: getQuery(),
            workspace_id: storeState.currentWorkspaceId,
        });
        state.allPage = getAllPage(total_count, 10);
        state.items = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};
const statAlerts = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
            activated_projects: props.activatedProjects,
            workspace_id: storeState.currentWorkspaceId,
        });
        const resolvedCount = find(results, { state: ALERT_STATE.RESOLVED })?.total || 0;
        const acknowledgedCount = find(results, { state: ALERT_STATE.ACKNOWLEDGED })?.total || 0;
        const triggeredCount = find(results, { state: ALERT_STATE.TRIGGERED })?.total || 0;
        tabState.tabItems.OPEN.count = sum([acknowledgedCount, triggeredCount]);
        tabState.tabItems.RESOLVED.count = resolvedCount;
        tabState.tabItems.ALL.count = sum([resolvedCount, acknowledgedCount, triggeredCount]);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* event */
const onPageChange = async () => {
    await listAlerts();
};
const onSelectAssignedState = (assignedState) => {
    state.isAssignedToMe = assignedState === ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME;
};
const onClickRefresh = async () => {
    state.thisPage = 1;
    await listAlerts();
};

/* Watcher */
watch(() => props.activatedProjects, async (activatedProjects) => {
    if (activatedProjects.length) {
        await Promise.all([listAlerts(), statAlerts()]);
    } else {
        state.loading = false;
    }
});

watch([() => state.isAssignedToMe, () => tabState.activeTab], async () => {
    state.thisPage = 1;
    await listAlerts();
});

</script>

<template>
    <div class="alert-state-widget">
        <p class="title">
            {{ $t('MONITORING.ALERT.DASHBOARD.ALERT_STATE') }}
        </p>
        <div class="content-wrapper">
            <!--tabs-->
            <p-balloon-tab v-model="tabState.activeTab"
                           class="desktop-balloon-tab"
                           :tabs="tabState.tabs"
                           size="lg"
                           position="left"
                           :style-type="tabState.tabItems[tabState.activeTab].styleType"
                           tail
            >
                <template #tab="{label, name}">
                    <div class="tab-button">
                        {{ label }}
                        <span class="count">{{ numberFormatter(tabState.tabItems[name].count) }}</span>
                    </div>
                </template>
            </p-balloon-tab>
            <p-balloon-tab v-model="tabState.activeTab"
                           class="tablet-balloon-tab"
                           :tabs="tabState.tabs"
                           size="sm"
                           :style-type="tabState.tabItems[tabState.activeTab].styleType"
            >
                <template #tab="{label, name}">
                    <span>{{ label }} <strong>{{ numberFormatter(tabState.tabItems[name].count) }}</strong></span>
                </template>
            </p-balloon-tab>
            <!--tab content-->
            <div class="tab-content-wrapper">
                <!--filter-->
                <div class="filter-wrapper">
                    <div class="left-part">
                        <p-select-status v-for="(status, idx) in state.urgencyList"
                                         :key="idx"
                                         v-model="state.selectedUrgency"
                                         :value="status.name"
                                         :icon="status.icon"
                                         :disable-check-icon="true"
                                         :icon-color="status.name === ALERT_URGENCY_FILTER.HIGH ? red[400] : undefined"
                                         @change="listAlerts"
                        >
                            {{ status.label }}
                        </p-select-status>
                    </div>
                    <div class="right-part">
                        <p-select-button v-for="(assignedState, idx) in state.assignedStateList"
                                         :key="`assigned-${idx}`"
                                         v-model="state.selectedAssignedState"
                                         :value="assignedState.name"
                                         size="sm"
                                         style-type="gray"
                                         @change="onSelectAssignedState"
                        >
                            {{ assignedState.label }}
                        </p-select-button>
                        <p-text-pagination :this-page.sync="state.thisPage"
                                           :all-page="state.allPage"
                                           @pageChange="onPageChange"
                        />
                        <p-icon-button name="ic_refresh"
                                       @click="onClickRefresh"
                        />
                    </div>
                </div>
                <!--list-->
                <p-list-card :items="state.items"
                             :loading="state.loading"
                             :hoverable="true"
                >
                    <template #header>
                        <div class="mobile-header">
                            <p-checkbox v-model="state.isAssignedToMe">
                                <span>{{ $t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
                            </p-checkbox>
                            <p-text-pagination
                                :this-page.sync="state.thisPage"
                                :all-page="state.allPage"
                                :show-page-number="false"
                                @pageChange="onPageChange"
                            />
                        </div>
                    </template>
                    <template #item="{ item }">
                        <alert-list-item :item="item"
                                         :show-project-link="true"
                                         :project-reference="state.projects[item.project_id]"
                                         :user-reference="state.users[item.assignee]"
                        />
                    </template>
                    <template #no-data>
                        <div>
                            <p class="text">
                                {{ $t('MONITORING.ALERT.DASHBOARD.NO_ALERT') }}
                            </p>
                        </div>
                    </template>
                </p-list-card>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-state-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.6;
        font-weight: bold;
        margin-bottom: 1.25rem;
    }

    .content-wrapper {
        @apply grid grid-cols-12 gap-2;
        vertical-align: middle;

        /* custom design-system component - .p-balloon-tab */
        :deep(.p-balloon-tab) {
            @apply col-span-3;

            &.desktop-balloon-tab {
                .balloon-group {
                    width: 100%;
                    margin: 0;

                    button {
                        height: 4.375rem;
                        padding: 1rem;
                        margin: 0.375rem 0;

                        &:first-child {
                            margin-top: 0;
                        }
                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                    .tab-button {
                        display: flex;
                        align-items: center;
                        .count {
                            font-size: 1.25rem;
                            margin-left: auto;
                        }
                    }
                }
            }
            &.tablet-balloon-tab {
                display: none;
            }
        }

        .tab-content-wrapper {
            @apply col-span-9;
            position: relative;

            .filter-wrapper {
                position: absolute;
                display: flex;
                width: 100%;
                top: -2.75rem;

                .left-part {
                    display: inline-flex;
                    flex-grow: 1;
                    gap: 1rem;
                    font-size: 0.875rem;
                }

                .right-part {
                    display: flex;
                    align-items: center;
                    height: 1.5rem;

                    .p-select-button {
                        margin-right: 0.375rem;
                    }
                }
            }

            /* custom design-system component - p-list-card */
            :deep(.p-list-card) {
                header {
                    display: none;
                }
                .body {
                    @apply border rounded-t-lg;
                    border-color: inherit;
                    width: 100%;
                    height: 100%;
                    max-height: 14.5rem;
                    overflow-y: auto;
                }
                .loader {
                    max-height: 14.5rem;
                }
                &.no-data {
                    display: flex;
                    height: 100%;
                    align-items: center;
                    justify-content: center;
                }
            }
            .p-empty {
                @apply border border-gray-200 text-gray-300 rounded-md;
                text-align: center;
                .p-i-icon {
                    margin-bottom: 0.5rem;
                }
                .text {
                    font-size: 1rem;
                    line-height: 1.6;
                }
            }
        }
    }

    @screen tablet {
        .content-wrapper {
            display: block;

            /* custom design-system component - .p-balloon-tab */
            :deep(.p-balloon-tab) {
                &.desktop-balloon-tab {
                    display: none;
                }
                &.tablet-balloon-tab {
                    display: flex;
                }
                .balloon-group {
                    margin-bottom: 1.5rem;

                    button {
                        height: auto;
                        padding: 0.375rem 1rem;
                        margin: 0.375rem;
                    }
                }
            }

            .tab-content-wrapper {
                .filter-wrapper {
                    position: relative;
                    top: 0;
                    margin-bottom: 1rem;

                    .right-part {
                        display: none;
                    }
                }

                /* custom design-system component - p-list-card */
                :deep(.p-list-card) {
                    header {
                        display: block;

                        .mobile-header {
                            display: flex;
                            height: 1.5rem;
                            justify-content: space-between;
                            align-items: center;

                            .p-checkbox {
                                .text {
                                    padding-left: 0.375rem;
                                }
                            }
                        }
                    }
                    .body {
                        border-top-width: 0;
                        border-top-left-radius: 0;
                        border-top-right-radius: 0;
                        max-height: 21.875rem;
                    }
                }
            }
        }
    }
}
</style>

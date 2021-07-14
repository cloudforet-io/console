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
                        {{ label }} <span class="count">{{ commaFormatter(tabState.tabItems[name].count) }}</span>
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
                    <span>{{ label }} <strong>{{ commaFormatter(tabState.tabItems[name].count) }}</strong></span>
                </template>
            </p-balloon-tab>
            <!--tab content-->
            <div class="tab-content-wrapper">
                <!--filter-->
                <div class="filter-wrapper">
                    <div class="left-part">
                        <p-select-status v-for="(status, idx) in urgencyList" :key="idx"
                                         v-model="selectedUrgency"
                                         :value="status.name"
                                         :icon="status.icon"
                                         :disable-check-icon="true"
                                         @change="listAlerts"
                        >
                            {{ status.label }}
                        </p-select-status>
                    </div>
                    <div class="right-part">
                        <p-select-button v-for="(state, idx) in assignedStateList" :key="`assigned-${idx}`"
                                         v-model="selectedAssignedState"
                                         :value="state.name"
                                         size="sm"
                                         style-type="gray"
                                         @change="onSelectAssignedState"
                        >
                            {{ state.label }}
                        </p-select-button>
                        <p-text-pagination :this-page.sync="thisPage"
                                           :all-page="allPage"
                                           @pageChange="onPageChange"
                        />
                        <p-icon-button name="ic_refresh" @click="onClickRefresh" />
                    </div>
                </div>
                <!--list-->
                <p-empty v-if="!loading && !items.length">
                    <div>
                        <p-i name="ic_alert" color="inherit transparent" />
                        <p class="text">
                            {{ $t('MONITORING.ALERT.DASHBOARD.NO_ALERT') }}
                        </p>
                    </div>
                </p-empty>
                <p-list-card v-else
                             :items="items"
                             :loading="loading"
                             :hoverable="true"
                             @click="onClickListItem"
                >
                    <template #header>
                        <div class="mobile-header">
                            <p-check-box v-model="isAssignedToMe">
                                <span>{{ $t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
                            </p-check-box>
                            <p-text-pagination
                                :this-page.sync="thisPage"
                                :all-page="allPage"
                                :show-page-number="false"
                                @pageChange="onPageChange"
                            />
                        </div>
                    </template>
                    <template #item="{item, index}">
                        <alert-list-item :item="item" :show-project-link="true" />
                    </template>
                </p-list-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, find, sum } from 'lodash';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBalloonTab, PListCard, PSelectStatus, PTextPagination, PSelectButton, PCheckBox, PIconButton, PEmpty, PI,
} from '@spaceone/design-system';

import AlertListItem from '@/views/monitoring/alert-manager/components/AlertListItem.vue';

import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { getAllPage } from '@spaceone/design-system/src/navigation/pagination/text-pagination/helper';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { commaFormatter } from '@spaceone/console-core-lib';
import { store } from '@/store';
import { i18n } from '@/translations';


const TAB_STATE = Object.freeze({
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
});

const ALERT_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
});

const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
});

export default {
    name: 'AlertStateWidget',
    components: {
        AlertListItem,
        PBalloonTab,
        PListCard,
        PSelectStatus,
        PTextPagination,
        PSelectButton,
        PCheckBox,
        PIconButton,
        PEmpty,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
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
        const state = reactive({
            loading: true,
            urgencyList: computed(() => ([
                {
                    name: ALERT_URGENCY.ALL,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL_URGENCY'),
                },
                {
                    name: ALERT_URGENCY.HIGH,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.HIGH'),
                    icon: 'ic_alert',
                },
                {
                    name: ALERT_URGENCY.LOW,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.LOW'),
                    icon: 'ic_state_duplicated',
                },
            ])),
            assignedStateList: computed(() => [
                {
                    name: ASSIGNED_STATE.ALL,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL'),
                },
                {
                    name: ASSIGNED_STATE.ASSIGNED_TO_ME,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME'),
                },
            ]),
            //
            selectedUrgency: ALERT_URGENCY.ALL,
            selectedAssignedState: ASSIGNED_STATE.ALL,
            isAssignedToMe: false,
            items: [],
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
            const filters: QueryStoreFilter[] = [];
            if (state.selectedUrgency !== ALERT_URGENCY.ALL) {
                filters.push({ k: 'urgency', v: state.selectedUrgency, o: '=' });
            }
            if (tabState.activeTab === TAB_STATE.OPEN) {
                filters.push({ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' });
            } else if (tabState.activeTab === TAB_STATE.RESOLVED) {
                filters.push({ k: 'state', v: ALERT_STATE.RESOLVED, o: '=' });
            }
            if (state.isAssignedToMe) {
                filters.push({ k: 'assignee', v: store.state.user.userId, o: '=' });
            }
            apiQuery.setFilters(filters);
            return apiQuery.data;
        };
        const listAlerts = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({ query: getQuery() });
                state.allPage = getAllPage(total_count, 10);
                state.items = results;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const statAlerts = async () => {
            try {
                const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState();
                const resolvedCount = find(results, { state: ALERT_STATE.RESOLVED }).total;
                const acknowledgedCount = find(results, { state: ALERT_STATE.ACKNOWLEDGED }).total;
                const triggeredCount = find(results, { state: ALERT_STATE.TRIGGERED }).total;
                tabState.tabItems.OPEN.count = sum([acknowledgedCount, triggeredCount]);
                tabState.tabItems.RESOLVED.count = resolvedCount;
                tabState.tabItems.ALL.count = sum([resolvedCount, acknowledgedCount, triggeredCount]);
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onPageChange = async () => {
            await listAlerts();
        };
        const onSelectAssignedState = (assignedState) => {
            state.isAssignedToMe = assignedState === ASSIGNED_STATE.ASSIGNED_TO_ME;
        };
        const onClickListItem = (idx) => {
            const alertId = get(state.items[idx], 'alert_id');
            if (alertId) vm.$router.push({ name: MONITORING_ROUTE.ALERT_MANAGER.ALERT.DETAIL._NAME, params: { id: alertId } });
        };
        const onClickRefresh = async () => {
            state.thisPage = 1;
            await listAlerts();
        };

        (async () => {
            await Promise.all([listAlerts(), statAlerts()]);
        })();

        watch([() => state.isAssignedToMe, () => tabState.activeTab], async () => {
            state.thisPage = 1;
            await listAlerts();
        });

        return {
            ...toRefs(state),
            tabState,
            onPageChange,
            onSelectAssignedState,
            onClickListItem,
            onClickRefresh,
            listAlerts,
            commaFormatter,
        };
    },
};
</script>

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

        .p-balloon-tab::v-deep {
            @apply col-span-3;

            &.tablet-balloon-tab {
                display: none;
            }
            .balloon-group {
                width: 100%;

                button {
                    height: 4.5rem;
                    padding: 1rem;
                    margin: 0.375rem 0;
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
            .p-list-card::v-deep {
                header {
                    display: none;
                }
                .body {
                    max-height: 14.5rem;
                    overflow-y: auto;
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

            .p-balloon-tab::v-deep {
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
                .p-list-card::v-deep {
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
                        max-height: 21.875rem;
                    }
                }
            }
        }
    }
}
</style>

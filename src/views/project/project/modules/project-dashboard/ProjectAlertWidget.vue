<template>
    <div class="project-alert-widget">
        <div class="title">
            <span>{{ $t('PROJECT.DETAIL.SUMMARY.ALERT') }}</span>
        </div>
        <div class="content-wrapper">
            <div class="button-group">
                <router-link v-for="(alertState, idx) in alertStates" :key="`button-${idx}`"
                             :to="alertLinkFormatter(alertState.name)"
                             class="button"
                             :style="{ color: alertState.color }"
                >
                    <strong>{{ counts[alertState.name] }}</strong> {{ alertState.label }}
                </router-link>
            </div>
            <p-list-card :items="items" :loading="loading" :hoverable="true"
                         @click="onClickListItem"
            >
                <template #header>
                    <p class="left-part">
                        <strong>{{ $t('PROJECT.DETAIL.SUMMARY.OPEN_ALERT') }}</strong> ({{ totalCount }})
                    </p>
                    <p class="right-part">
                        <p-select-button v-for="(state, idx) in assignedStateList" :key="`assigned-${idx}`"
                                         v-model="selectedAssignedState"
                                         class="assigned-button"
                                         :value="state.name"
                                         size="sm"
                                         style-type="gray"
                                         @change="listAlerts"
                        >
                            {{ state.label }}
                        </p-select-button>
                        <p-text-pagination
                            :this-page.sync="thisPage"
                            :all-page="allPage"
                            :show-page-number="false"
                            @pageChange="listAlerts"
                        />
                    </p>
                </template>
                <template #item="{item, index}">
                    <alert-list-item
                        :item="item"
                        :show-member-name="true"
                    />
                </template>
            </p-list-card>
        </div>
    </div>
</template>

<script lang="ts">
import { find, get } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PListCard, PSelectButton, PTextPagination,
} from '@spaceone/design-system';

import AlertListItem from '@/views/monitoring/alert-manager/components/AlertListItem.vue';

import { SpaceConnector } from '@/core-lib/space-connector';
import { getAllPage } from '@spaceone/design-system/src/navigation/pagination/text-pagination/helper';
import { ApiQueryHelper } from '@/core-lib/space-connector/helper';
import { getPageStart } from '@/core-lib/component-util/pagination';
import { QueryHelper } from '@/core-lib/query';
import { i18n } from '@/translations';
import { alert, secondary } from '@/styles/colors';
import { store } from '@/store';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import router from '@/routes';
import { Location } from 'vue-router';
import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { AlertListPageUrlQuery } from '@/views/monitoring/alert-manager/type';


const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
});

export default {
    name: 'ProjectAlertWidget',
    components: {
        AlertListItem,
        PListCard,
        PSelectButton,
        PTextPagination,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            alertStates: computed(() => ([
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
                    name: ASSIGNED_STATE.ALL,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.ALL'),
                },
                {
                    name: ASSIGNED_STATE.ASSIGNED_TO_ME,
                    label: i18n.t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME'),
                },
            ]),
            selectedAssignedState: ASSIGNED_STATE.ALL,
            items: [],
            totalCount: 0,
            thisPage: 1,
            allPage: 1,
            pageSize: 10,
        });

        /* util */
        const linkQueryHelper = new QueryHelper();
        const alertLinkFormatter = (alertState): Location => {
            linkQueryHelper.setFilters([
                { k: 'project_id', o: '=', v: props.projectId },
            ]);
            return {
                name: MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME,
                query: {
                    filters: linkQueryHelper.rawQueryStrings,
                    state: alertState,
                } as AlertListPageUrlQuery,
            };
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery
                .setSort('created_at', true)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
            if (state.selectedAssignedState === ASSIGNED_STATE.ASSIGNED_TO_ME) {
                apiQuery.setFilters([{ k: 'assignee', v: store.state.user.userId, o: '=' }]);
            } else {
                apiQuery.setFilters([]);
            }
            return apiQuery.data;
        };
        const listAlerts = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({ query: getQuery() });
                state.totalCount = total_count;
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
                const { results } = await SpaceConnector.client.statistics.topic.alertStateCount({
                    project_id: props.projectId,
                });
                state.alertStateCounts = results;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickListItem = (idx) => {
            const alertId = get(state.items[idx], 'alert_id');
            if (alertId) router.push({ name: MONITORING_ROUTE.ALERT_MANAGER.ALERT.DETAIL._NAME, params: { id: alertId } });
        };

        watch(() => props.projectId, async (projectId) => {
            if (projectId) {
                await Promise.all([statAlerts(), listAlerts()]);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            listAlerts,
            onClickListItem,
            alertLinkFormatter,
        };
    },
};
</script>

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
    .p-list-card::v-deep {
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
        .p-list-card::v-deep {
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

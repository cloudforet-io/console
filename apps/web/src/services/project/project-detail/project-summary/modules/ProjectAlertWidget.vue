<template>
    <div class="project-alert-widget">
        <div class="title">
            <span>{{ $t('PROJECT.DETAIL.SUMMARY.ALERT') }}</span>
        </div>
        <div class="content-wrapper">
            <div class="button-group">
                <router-link v-for="(alertState, idx) in alertStates"
                             :key="`button-${idx}`"
                             :to="alertLinkFormatter(alertState.name)"
                             class="button"
                             :style="{ color: alertState.color }"
                >
                    <strong>{{ commaFormatter(counts[alertState.name]) }}</strong> {{ alertState.label }}
                </router-link>
            </div>
            <p-list-card :items="items"
                         :loading="loading"
                         :hoverable="true"
            >
                <template #header>
                    <p class="left-part">
                        <strong>{{ $t('PROJECT.DETAIL.SUMMARY.OPEN_ALERT') }}</strong> ({{ commaFormatter(totalCount) }})
                    </p>
                    <p class="right-part">
                        <p-select-button v-for="(state, idx) in assignedStateList"
                                         :key="`assigned-${idx}`"
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
                <template #item="{item}">
                    <alert-list-item
                        :item="item"
                        :show-member-name="true"
                        :user-reference="users[item.assignee]"
                    />
                </template>
            </p-list-card>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PListCard, PSelectButton, PTextPagination,
} from '@spaceone/design-system';
import { find } from 'lodash';

import { commaFormatter } from '@cloudforet/core-lib';
import { getAllPage, getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { alert, secondary } from '@/styles/colors';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import AlertListItem from '@/services/alert-manager/modules/AlertListItem.vue';
import type { AlertListPageUrlQuery } from '@/services/alert-manager/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';

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
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
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
        const alertLinkFormatter = (alertState): Location => ({
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME,
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
            if (state.selectedAssignedState === ASSIGNED_STATE.ASSIGNED_TO_ME) {
                apiQuery.setFilters([{ k: 'assignee', v: store.state.user.userId, o: '=' }]);
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
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    project_id: props.projectId,
                    query: getQuery(),
                });
                state.totalCount = total_count;
                state.allPage = getAllPage(total_count, 10);
                state.items = results;
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

        (async () => {
            await store.dispatch('reference/user/load');
        })();

        watch(() => props.projectId, async (projectId) => {
            if (projectId) {
                await Promise.all([statAlerts(), listAlerts()]);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            listAlerts,
            alertLinkFormatter,
            commaFormatter,
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

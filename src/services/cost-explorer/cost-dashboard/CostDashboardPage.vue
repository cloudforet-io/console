<template>
    <div class="cost-dashboard-page">
        <div v-if="dashboardList.length"
             class="top-wrapper"
        >
            <p-heading :title="dashboard.name || $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')">
                <template #title-left-extra>
                    <p-i v-if="dashboardType === DASHBOARD_TYPE.PUBLIC"
                         name="ic_public"
                         width="1rem"
                         height="1rem"
                         :color="PUBLIC_ICON_COLOR"
                    />
                </template>
                <template #title-right-extra>
                    <div class="left-part">
                        <p-icon-button name="ic_edit-text"
                                       class="edit-btn"
                                       :disabled="!hasManagePermission && dashboardType === DASHBOARD_TYPE.PUBLIC"
                                       @click.stop="handleClickEditDashboard"
                        />
                        <cost-dashboard-more-menu :dashboard-id="dashboardId"
                                                  :dashboard="dashboard"
                                                  :manage-disabled="!hasManagePermission"
                        />
                    </div>
                    <div class="right-part">
                        <div>
                            <cost-dashboard-period-select-dropdown :dashboard-id="dashboardId"
                                                                   :period.sync="period"
                                                                   :period-type.sync="periodType"
                                                                   :manage-disabled="!hasManagePermission"
                            />
                            <div class="left-divider download-pdf">
                                <pdf-download-button icon-only
                                                     @click="handleClickPdfDownload"
                                />
                            </div>
                            <div class="left-divider">
                                <p-button icon-left="ic_edit"
                                          style-type="tertiary"
                                          size="sm"
                                          :disabled="!hasManagePermission && dashboardType === DASHBOARD_TYPE.PUBLIC"
                                          @click.stop="handleClickCustomize"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CUSTOMIZE') }}
                                </p-button>
                            </div>
                        </div>
                    </div>
                </template>
            </p-heading>
            <cost-dashboard-filter :dashboard-id="dashboardId"
                                   :filters.sync="filters"
                                   :manage-disabled="!hasManagePermission"
            />
        </div>
        <div v-if="!loading && !dashboardListLoading">
            <dashboard-layouts
                v-if="dashboardList.length > 0"
                :loading="loading"
                :layout="layout"
                :period="period"
                :filters="filters"
                :currency="currency"
                :currency-rates="currencyRates"
            />
            <div v-else
                 class="empty-dashboard"
            >
                <img src="@/assets/images/illust_circle_boy.svg"
                     class="empty-img"
                >
                <span class="empty-text">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.NO_SAVED_DASHBOARD_FOUND') }}</span>
                <p-button v-if="hasManagePermission"
                          icon-left="ic_plus"
                          style-type="substitutive"
                          @click="handleClickCreate"
                >
                    <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE_DASHBOARD') }}</span>
                </p-button>
            </div>
        </div>
        <cost-dashboard-update-modal :visible.sync="updateModalVisible"
                                     :dashboard-id="dashboardId"
                                     :dashboard-name="dashboard.name"
                                     @confirm="handleUpdateConfirm"
        />
        <pdf-download-overlay v-model="visiblePdfDownload"
                              :items="previewItems"
                              :file-name="pdfFileName"
        >
            <cost-dashboard-preview v-if="dashboardId"
                                    :dashboard-id="dashboardId"
                                    :period="period"
                                    :filters="filters"
                                    @rendered="handlePreviewRendered"
            />
        </pdf-download-overlay>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PI, PIconButton, PButton, PHeading,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import PdfDownloadButton from '@/common/components/buttons/PdfDownloadButton.vue';
import type { Item } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import PdfDownloadOverlay from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { gray } from '@/styles/colors';

import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';
import { getDashboardLayout } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import CostDashboardFilter from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardFilter.vue';
import CostDashboardMoreMenu from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardMoreMenu.vue';
import CostDashboardPeriodSelectDropdown
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardPeriodSelectDropdown.vue';
import CostDashboardPreview from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardPreview.vue';
import CostDashboardUpdateModal
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardUpdateModal.vue';
import DashboardLayouts from '@/services/cost-explorer/cost-dashboard/modules/DashboardLayouts.vue';
import type { DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { convertFiltersInToNewType } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type { CostFiltersMap, Period } from '@/services/cost-explorer/type';

const PUBLIC_ICON_COLOR = gray[500];

const validateDashboardId = async (dashboardId): Promise<boolean> => {
    await costExplorerStore.dispatch('setDashboardList');
    const dashboardList = costExplorerStore.getters.dashboardList;
    const targetDashboard = dashboardList.find((item) => item.dashboard_id === dashboardId);
    return !!targetDashboard;
};

export default {
    name: 'CostDashboardPage',
    components: {
        PdfDownloadButton,
        CostDashboardUpdateModal,
        CostDashboardPreview,
        PdfDownloadOverlay,
        CostDashboardPeriodSelectDropdown,
        CostDashboardMoreMenu,
        DashboardLayouts,
        CostDashboardFilter,
        PHeading,
        PIconButton,
        PButton,
        PI,
    },
    beforeRouteEnter(to, from, next) {
        next(async () => {
            if (!await validateDashboardId(to.params.dashboardId)) {
                next({
                    name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
                    params: {},
                });
                return;
            }
            next();
        });
    },
    props: {
        dashboardId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            dashboard: {} as DashboardInfo,
            loading: true,
            layout: [] as any[],
            period: {} as Period,
            periodType: '',
            filters: {} as CostFiltersMap,
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            homeDashboardId: computed<string|undefined>(() => costExplorerStore.getters.homeDashboardId),
            visiblePdfDownload: false,
            previewItems: [] as Item[],
            pdfFileName: computed<string>(() => `${state.dashboard.name ?? 'Cost_Dashboard'}_${dayjs().format('YYYYMMDD')}`),
            dashboardType: computed(() => (Object.prototype.hasOwnProperty.call(state.dashboard, 'public_dashboard_id') ? 'public' : 'user')),
            updateModalVisible: false,
            dashboardList: computed(() => costExplorerStore.getters.dashboardList ?? []),
            dashboardListLoading: computed(() => costExplorerStore.state.dashboardListLoading),
        });

        /* event */
        const handleClickEditDashboard = () => {
            state.updateModalVisible = true;
        };

        const handleUpdateConfirm = (name) => {
            state.dashboard.name = name;
        };

        const handleClickPdfDownload = () => {
            state.visiblePdfDownload = true;
        };

        const handleClickCustomize = () => {
            SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.DASHBOARD.CUSTOMIZE._NAME, params: { dashboardId: props.dashboardId } });
        };

        const handlePreviewRendered = (elements: HTMLElement[]) => {
            state.previewItems = elements.map((element) => ({ element, type: 'image' }));
        };

        const fetchDashboard = async (dashboardId: string): Promise<DashboardInfo> => {
            try {
                if (dashboardId.startsWith('user')) {
                    return await SpaceConnector.client.costAnalysis.userDashboard.get({
                        user_dashboard_id: dashboardId,
                    });
                }
                return await SpaceConnector.client.costAnalysis.publicDashboard.get({
                    public_dashboard_id: dashboardId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return {} as DashboardInfo;
            }
        };

        const handleClickCreate = () => {
            SpaceRouter.router.push({
                name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
            });
        };

        const loadDashboardAndSetStates = async (dashboardId: string) => {
            state.loading = true;

            const dashboard = await fetchDashboard(dashboardId);
            state.dashboard = dashboard;
            state.layout = await getDashboardLayout(dashboard);
            state.filters = convertFiltersInToNewType(dashboard.default_filter);
            state.period = dashboard.period ?? {};
            state.periodType = dashboard.period_type;

            state.loading = false;
        };

        watch([() => props.dashboardId, () => state.homeDashboardId], async ([dashboardId, homeDashboardId], before) => {
            if (!dashboardId) {
                if (homeDashboardId) {
                    SpaceRouter.router.replace({
                        params: { dashboardId: homeDashboardId },
                    });
                }
                return;
            }
            if (before && dashboardId === before[0]) return;

            await loadDashboardAndSetStates(dashboardId);
        }, { immediate: true });

        watch(() => state.filters, (after) => {
            if (after) {
                state.dashboard.default_filter = after;
            }
        });

        watch([() => state.period, () => state.periodType], (after) => {
            if (after) {
                state.dashboard.period = after[0];
                state.dashboard.period_type = after[1];
            }
        });

        return {
            ...toRefs(state),
            handleClickEditDashboard,
            handleUpdateConfirm,
            handleClickPdfDownload,
            handleClickCustomize,
            handlePreviewRendered,
            handleClickCreate,
            DASHBOARD_TYPE,
            PUBLIC_ICON_COLOR,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-page {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.p-heading {
    margin-bottom: 0;
}
.top-wrapper {
    @apply flex flex-wrap items-center;
    row-gap: 1rem;
    min-width: 62.25rem;
    max-width: 117rem;
    .left-part {
        display: inline-flex;
        align-items: center;
        line-height: 1;
        .more-button {
            @apply bg-transparent;
        }
    }
    .right-part {
        float: right;
        > div {
            display: inline-flex;
            align-items: center;
            line-height: 1;
            .download-pdf {
                margin-left: 0;
            }
        }
    }

    .left-divider {
        @apply relative;
        padding-left: 0.5rem;
        margin-left: 0.5rem;
        &::before {
            @apply bg-gray-300;
            position: absolute;
            top: 50%;
            left: 0;
            display: inline-block;
            width: 0.0625rem;
            height: 1.25rem;
            content: ' ';
            margin-top: calc(-1.25rem / 2);
        }
    }
}

.empty-dashboard {
    @apply text-center;
    margin-top: 10.25rem;
    .empty-img {
        margin: 0 auto 1rem;
    }
    .empty-text {
        @apply text-violet-300 font-bold block;
        font-size: 0.875rem;
        line-height: 160%;
        margin-bottom: 0.5rem;
        opacity: 0.7;
    }
}

@screen tablet {
    .top-wrapper {
        min-width: 100%;
        max-width: 100%;
    }
}

@screen mobile {
    .left-part {
        margin-left: 0;
    }
    .right-part {
        @apply flex flex-wrap justify-end;
    }
}
</style>

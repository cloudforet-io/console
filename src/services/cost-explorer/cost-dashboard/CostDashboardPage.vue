<template>
    <div class="cost-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <div v-if="dashboardList.length" class="top-wrapper">
            <p-i v-if="dashboardType === DASHBOARD_TYPE.PUBLIC" name="ic_public" width="1rem"
                 height="1rem" :color="PUBLIC_ICON_COLOR"
                 class="mr-2"
            />
            <p-page-title :title="dashboard.name || $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
            <div class="left-part">
                <p-icon-button name="ic_edit-text"
                               class="edit-btn"
                               :outline="false"
                               :disabled="!isAdmin && dashboardType === DASHBOARD_TYPE.PUBLIC"
                               @click.stop="handleClickEditDashboard"
                />
                <cost-dashboard-more-menu :dashboard-id="dashboardId" :dashboard="dashboard" />
            </div>
            <div class="right-part">
                <cost-dashboard-period-select-dropdown :dashboard-id="dashboardId"
                                                       :period.sync="period"
                                                       :period-type.sync="periodType"
                />
                <div class="left-divider download-pdf">
                    <pdf-download-button>
                        <p-icon-button name="ic_download" style-type="gray-border" size="sm"
                                       @click="handleClickPdfDownload"
                        />
                    </pdf-download-button>
                </div>
                <div class="left-divider">
                    <p-icon-text-button name="ic_edit" style-type="gray-border" size="sm"
                                        @click.stop="handleClickCustomize"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CUSTOMIZE') }}
                    </p-icon-text-button>
                </div>
            </div>
            <cost-dashboard-filter :dashboard-id="dashboardId" :filters.sync="filters" />
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
            <div v-else class="empty-dashboard">
                <img src="@/assets/images/illust_circle_boy.svg" class="empty-img">
                <span class="empty-text">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.NO_SAVED_DASHBOARD_FOUND') }}</span>
                <p-icon-text-button v-if="isAdmin" name="ic_plus" style-type="primary1"
                                    @click="handleClickCreate"
                >
                    <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE_DASHBOARD') }}</span>
                </p-icon-text-button>
            </div>
        </div>
        <cost-dashboard-update-modal :visible.sync="updateModalVisible"
                                     :dashboard-id="dashboardId"
                                     :dashboard-name="dashboard.name"
                                     @confirm="handleUpdateConfirm"
        />
        <pdf-download-overlay v-model="visiblePdfDownload" :items="previewItems" :file-name="pdfFileName">
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
import dayjs from 'dayjs';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PBreadcrumbs, PI, PIconButton, PIconTextButton, PPageTitle,
} from '@spaceone/design-system';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

import DashboardLayouts from '@/services/cost-explorer/cost-dashboard/modules/DashboardLayouts.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import CostDashboardFilter from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardFilter.vue';
import CostDashboardMoreMenu from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardMoreMenu.vue';
import CostDashboardPeriodSelectDropdown
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardPeriodSelectDropdown.vue';
import { DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { CostQueryFilters, Period } from '@/services/cost-explorer/type';
import { SpaceRouter } from '@/router';
import PdfDownloadOverlay, { Item } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import CostDashboardPreview from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardPreview.vue';
import { getDashboardLayout } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import CostDashboardUpdateModal
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardUpdateModal.vue';
import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';
import { gray } from '@/styles/colors';
import PdfDownloadButton from '@/common/components/buttons/PdfDownloadButton.vue';

const PUBLIC_ICON_COLOR = gray[500];

const validateDashboardId = async (dashboardId): Promise<boolean> => {
    await store.dispatch('service/costDashboard/setDashboardList');
    const dashboardList = store.getters['service/costDashboard/dashboardList'];
    const targetDashboard = dashboardList.find(item => item.dashboard_id === dashboardId);
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
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        PIconTextButton,
        PI,
    },
    props: {
        dashboardId: {
            type: String,
            default: undefined,
        },
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
    setup(props) {
        const state = reactive({
            dashboard: {} as DashboardInfo,
            loading: true,
            layout: [] as any[],
            period: {} as Period,
            periodType: '',
            filters: {} as CostQueryFilters,
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            homeDashboardId: computed<string|undefined>(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
            visiblePdfDownload: false,
            previewItems: [] as Item[],
            pdfFileName: computed<string>(() => `${state.dashboard.name ?? 'Cost_Dashboard'}_${dayjs().format('YYYYMMDD')}`),
            dashboardType: computed(() => (Object.prototype.hasOwnProperty.call(state.dashboard, 'public_dashboard_id') ? 'public' : 'user')),
            updateModalVisible: false,
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            dashboardList: computed(() => store.getters['service/costDashboard/dashboardList'] ?? []),
            dashboardListLoading: computed(() => store.state.service.costDashboard.dashboardListLoading),
        });

        const routeState = reactive({
            route: computed(() => [
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Dashboard', to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME } },
                { name: state.dashboard.name || props.dashboardId },
            ]),
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
            state.previewItems = elements.map(element => ({ element, type: 'image' }));
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
            state.filters = dashboard.default_filter;
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
            routeState,
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
.top-wrapper {
    @apply flex flex-wrap items-center;
    row-gap: 1rem;
    min-width: 62.25rem;
    max-width: 117rem;
    padding-right: 1.5rem;
    .p-page-title::v-deep {
        width: auto;
        margin-bottom: 0;
        > .title-wrapper > h2 {
            word-break: break-word;
            max-width: 100%;
        }
    }
    .left-part {
        display: flex;
        align-items: center;
        margin-left: 0.5rem;
        .more-button {
            @apply bg-transparent;
        }
    }
    .right-part {
        @apply flex items-center;
        margin-left: auto;
        .download-pdf {
            &::v-deep {
                margin-left: 0;
                .p-button {
                    padding: 0 1rem;
                }
            }
        }
    }

    &::v-deep .left-divider {
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
    .p-page-title::v-deep .title-wrapper h2 {
        width: 100%;
    }
    .left-part {
        margin-left: 0;
    }
    .right-part {
        @apply flex flex-wrap justify-end;
    }
}
</style>

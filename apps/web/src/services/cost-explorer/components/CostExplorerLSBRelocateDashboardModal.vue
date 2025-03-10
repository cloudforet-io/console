<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { PButton, PDivider } from '@cloudforet/mirinae';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';


import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

interface Props {
    visible: boolean;
}

const router = useRouter();
withDefaults(defineProps<Props>(), {
    visible: false,
});
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();
const costExplorerSettingsStore = useCostExplorerSettingsStore();
const costExplorerSettingsState = costExplorerSettingsStore.$state;
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void}>();

const handleClose = () => {
    emit('update:visible', false);
};

const handleReject = () => {
    costExplorerSettingsStore.setRelocateDashboardState({
        ...costExplorerSettingsState.relocateDashboardStatus,
        hideModal: true,
    }, userStore.state.userId);
    emit('update:visible', false);
};

const handleRouteToDashboard = () => {
    const dashboardQuery = new QueryHelper().setFilters([{
        k: 'label',
        v: ['Cost'],
        o: '=',
    }]).rawQueryStrings;
    const dashboardRouteName = appContextStore.getters.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE._NAME
        : DASHBOARDS_ROUTE._NAME;
    const routeData = router.resolve({
        name: dashboardRouteName,
        params: {
            workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
        },
        query: {
            filters: dashboardQuery,
        },
    });
    window.open(routeData.href, '_blank');
};

</script>

<template>
    <section class="cost-explorer-l-s-b-relocate-dashboard-modal">
        <transition v-if="visible"
                    name="modal"
        >
            <div class="modal-mask">
                <article class="modal-content">
                    <div class="image-wrapper">
                        <img src="@/assets/images/go_to_dashboard.png"
                             srcset="@/assets/images/go_to_dashboard@2x.png 2x,
                                    @/assets/images/go_to_dashboard@3x.png 3x"
                             alt="relocate-dashboard-image"
                        >
                    </div>
                    <div class="main-content-wrapper">
                        <div class="update-badge">
                            <p class="text">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FEATURE_UDATED') }}
                            </p>
                        </div>
                        <div class="title">
                            <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_MODAL_TITLE') }}</p>
                        </div>
                        <div class="description">
                            <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_MODAL_DESCRIPTION_FIRST') }}</p>
                            <p>{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_MODAL_DESCRIPTION_SECOND') }}</p>
                        </div>
                        <p-button style-type="tertiary"
                                  icon-right="ic_arrow-right-up"
                                  @click="handleRouteToDashboard"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_LABEL') }}
                        </p-button>
                        <p-divider class="divider" />
                        <div class="footer">
                            <p-button style-type="tertiary"
                                      @click="handleReject"
                            >
                                {{ $t("BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_MODAL_DISMISS_TEXT") }}
                            </p-button>
                            <p-button @click="handleClose">
                                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_MODAL_CONFIRM_TEXT') }}
                            </p-button>
                        </div>
                    </div>
                </article>
            </div>
        </transition>
    </section>
</template>

<style lang="postcss" scoped>
.cost-explorer-l-s-b-relocate-dashboard-modal {
    display: inline-block;

    .modal-content {
        @apply bg-white border border-gray-200 rounded-lg;
        width: 30rem;
        padding: 0.5rem 0.5rem 2rem;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 0.5rem rgba(theme('colors.gray.900'), 0.32);

        .image-wrapper {
            @apply w-full;
            margin-bottom: 1.5rem;
        }

        .main-content-wrapper {
            padding: 0 1.5rem;
            .update-badge {
                @apply inline-flex justify-center items-center rounded-xs bg-violet-100;
                padding: 0.25rem 0.5rem;
                margin-bottom: 0.5rem;
                .text {
                    @apply font-bold text-label-md;
                    background: linear-gradient(90deg, theme('colors.violet.600') 0%, rgba(0, 128, 251, 1) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }
            .title {
                @apply text-display-sm text-gray-900;
                margin-bottom: 1rem;
            }
            .description {
                @apply text-label-md text-gray-900 flex flex-col gap-2;
                margin-bottom: 1rem;
            }

            .divider {
                margin: 1.5rem 0;
            }

            .footer {
                @apply flex justify-between items-center;
            }
        }
    }
}

</style>

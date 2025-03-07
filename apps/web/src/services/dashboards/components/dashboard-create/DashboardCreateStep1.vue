<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { flatMapDeep, uniq } from 'lodash';

import {
    PEmpty, PSearch, PFieldTitle, PButton,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';


import DashboardCreateBlankBoardItem from '@/services/dashboards/components/dashboard-create/DashboardCreateBlankBoardItem.vue';
import type { FilterLabelItem } from '@/services/dashboards/components/dashboard-create/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/dashboard-create/DashboardCreateStep1SearchFilter.vue';
import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



const emit = defineEmits<{(e: 'click-next'): void }>();
const router = useRouter();


const appContextStore = useAppContextStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();

const queryState = reactive({
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    allDashboardItems: computed(() => [...queryState.publicDashboardItems, ...queryState.privateDashboardItems]),
});

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const state = reactive({
    templates: [] as DashboardTemplateModel[],
    blankTemplate: computed<BoardSet[]>(() => ([{
        template_id: 'blank',
        name: 'Blank',
    }])),
    ootbTemplateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        const results: TreeNode<DashboardTreeDataType>[] = [];
        const _filteredTemplates = getFilteredTemplates(dashboardCreatePageState.dashboardTemplates, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
        _filteredTemplates.forEach((d) => {
            results.push({
                id: d.template_id,
                depth: 0,
                data: {
                    name: d.name,
                    id: d.template_id,
                    type: 'DASHBOARD',
                    labels: d.labels,
                },
            });
        });
        return results;
    }),
    allExistingLabels: computed<string[]>(() => {
        const _ootbTemplates = getFilteredTemplates(dashboardCreatePageState.dashboardTemplates, '', [], []);
        const _existingTemplates = getFilteredTemplates(queryState.allDashboardItems, '', [], []);

        const _ootbLabels = flatMapDeep(_ootbTemplates.map((d) => d.labels ?? []));
        const _existingLabels = flatMapDeep(_existingTemplates.map((d) => d.labels ?? []));
        return uniq([..._ootbLabels, ..._existingLabels]);
    }),
});

const filterState = reactive({
    inputValue: '',
    selectedLabels: [] as string[],
    selectedProviders: [] as string[],
});

/* Util */
const getFilteredTemplates = (
    dashboards: Array<DashboardModel|DashboardTemplateModel>,
    inputValue: string,
    selectedLabels: FilterLabelItem[],
    selectedProviders: FilterLabelItem[],
): Array<DashboardModel|DashboardTemplateModel> => {
    const _inputValue = inputValue.toLowerCase();
    const _selectedLabels = selectedLabels;
    const _selectedProviders = selectedProviders;
    return dashboards
        .filter((d) => (!_selectedLabels.length || d.labels?.some((label) => _selectedLabels.includes(label.toLowerCase()))))
        .filter((d) => (!_selectedProviders.length || d.labels?.some((label) => _selectedProviders.includes(label.toLowerCase()))))
        .filter((d) => (_inputValue === '' || d.name?.toLowerCase().includes(_inputValue.toLowerCase())));
};

/* Event */
const handleSelectLabels = (labels: FilterLabelItem[]) => {
    filterState.selectedLabels = labels.map((d) => d.name.toLowerCase());
};
const handleSelectProvider = (providers: FilterLabelItem[]) => {
    filterState.selectedProviders = providers.map((d) => d.label.toLowerCase());
};
const handleClickCancel = () => {
    const dashboardRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE._NAME
        : DASHBOARDS_ROUTE._NAME;
    router.push({ name: dashboardRouteName }).catch(() => {});
};

onMounted(() => {
    dashboardCreatePageStore.listDashboardTemplates();
});
</script>

<template>
    <div class="dashboard-create-step-1">
        <!--        <div v-if="storeState.isAdminMode"-->
        <!--             class="dashboard-type-wrapper"-->
        <!--        >-->
        <!--            <p-field-title size="lg"-->
        <!--                           :label="$t('DASHBOARDS.CREATE.DASHBOARD_TYPE')"-->
        <!--                           :description="$t('DASHBOARDS.CREATE.DASHBOARD_TYPE_DESC')"-->
        <!--            />-->
        <!--            <div class="dashboard-type-select-card-wrapper">-->
        <!--                <p-select-card class="col-span-6"-->
        <!--                               :label="i18n.t('DASHBOARDS.CREATE.WORKSPACE_DASHBOARD')"-->
        <!--                               icon="ic_service_workspaces"-->
        <!--                               :selected="dashboardCreatePageState.adminDashboardType === 'WORKSPACE'"-->
        <!--                               @click="dashboardCreatePageStore.setAdminDashboardType('WORKSPACE')"-->
        <!--                />-->
        <!--                <p-select-card class="col-span-6"-->
        <!--                               :label="i18n.t('DASHBOARDS.CREATE.ADMIN_DASHBOARD')"-->
        <!--                               icon="ic_admin-icon"-->
        <!--                               :selected="dashboardCreatePageState.adminDashboardType === 'ADMIN'"-->
        <!--                               @click="dashboardCreatePageStore.setAdminDashboardType('ADMIN')"-->
        <!--                />-->
        <!--            </div>-->
        <!--            <p-divider class="divider" />-->
        <!--            <p-field-title size="lg"-->
        <!--                           :label="$t('DASHBOARDS.CREATE.DASHBOARD_TEMPLATE')"-->
        <!--                           :description="$t('DASHBOARDS.CREATE.DASHBOARD_TEMPLATE_DESC')"-->
        <!--            />-->
        <!--        </div>-->
        <div class="contents-container">
            <dashboard-create-step1-search-filter :labels="state.allExistingLabels"
                                                  @select-label="handleSelectLabels"
                                                  @select-provider="handleSelectProvider"
            />
            <div class="template-contents-area">
                <p-search :value.sync="filterState.inputValue"
                          class="search-wrapper"
                />
                <dashboard-create-blank-board-item :template-sets="state.blankTemplate"
                                                   class="blank-board"
                />
                <p-field-title :label="i18n.t('DASHBOARDS.CREATE.OOTB_DASHBOARD')"
                               class="field-title"
                               required
                />
                <dashboard-folder-tree :selected-id-map="dashboardCreatePageState.selectedOotbIdMap"
                                       :dashboard-tree-data="state.ootbTemplateTreeData"
                                       readonly-mode
                                       disable-link
                                       @update:selectedIdMap="dashboardCreatePageStore.setSelectedOotbIdMap"
                />
                <p-empty v-if="!state.ootbTemplateTreeData.length"
                         show-image
                         class="empty-template"
                >
                    <template #image>
                        <img alt="empty-image"
                             class="empty-image"
                             src="@/assets/images/img_ghost.png"
                        >
                    </template>
                    No Data
                </p-empty>
                <div class="step-button-wrapper">
                    <p-button style-type="transparent"
                              @click="handleClickCancel"
                    >
                        {{ $t('DASHBOARDS.CREATE.CANCEL') }}
                    </p-button>
                    <p-button icon-right="ic_arrow-right"
                              style-type="substitutive"
                              :disabled="dashboardCreatePageGetters.noBundleSelected"
                              @click="emit('click-next')"
                    >
                        {{ $t('DASHBOARDS.CREATE.NEXT') }}
                    </p-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step-1 {
    @apply flex flex-col h-full;
    width: 100%;
    overflow: visible;
    .dashboard-type-wrapper {
        .dashboard-type-select-card-wrapper {
            @apply grid grid-cols-12;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
        .divider {
            margin: 2rem 0;
        }
    }
    .contents-container {
        @apply flex gap-4;
        margin-top: 1.5rem;

        @apply tablet:flex-col;

        .template-contents-area {
            flex-grow: 1;

            .search-wrapper {
                margin-bottom: 1.5rem;
            }
            .blank-board {
                padding-bottom: 2rem;
            }
            .field-title {
                margin-bottom: 0.5rem;
            }
            .empty-template {
                padding-top: 3rem;
                .empty-image {
                    width: 5rem;
                    height: 5rem;
                }
            }
            .step-button-wrapper {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                justify-content: flex-end;
            }
        }
    }
}
</style>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { flatMapDeep, uniq } from 'lodash';

import {
    PEmpty, PSearch, PFieldTitle, PButton,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardCreateBlankBoardItem from '@/services/dashboards/components/dashboard-create/DashboardCreateBlankBoardItem.vue';
import type { FilterLabelItem } from '@/services/dashboards/components/dashboard-create/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/dashboard-create/DashboardCreateStep1SearchFilter.vue';
import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import { getDashboardTreeData } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



const emit = defineEmits<{(e: 'click-next'): void }>();
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
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
    existingDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        let folderItems: FolderModel[] = dashboardGetters.allFolderItems;
        let dashboardItems: DashboardModel[] = getFilteredTemplates(dashboardGetters.allDashboardItems, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
        if (storeState.isAdminMode) {
            folderItems = dashboardGetters.domainFolderItems;
            dashboardItems = dashboardGetters.domainDashboardItems;
        } else if (storeState.isWorkspaceMember) {
            folderItems = dashboardGetters.privateFolderItems;
            dashboardItems = dashboardGetters.privateDashboardItems;
        }
        const _refinedDashboardItems = dashboardItems.filter((d) => d.version !== '1.0');
        return getDashboardTreeData(folderItems, _refinedDashboardItems);
    }),
    allExistingLabels: computed(() => {
        const ootbTemplates = getFilteredTemplates(dashboardCreatePageState.dashboardTemplates, '', [], []);
        const dashboards: DashboardModel[] = storeState.isWorkspaceMember ? dashboardGetters.privateDashboardItems : dashboardGetters.allDashboardItems;
        const existingTemplates = getFilteredTemplates(dashboards, '', [], []);
        return uniq([
            ...flatMapDeep(ootbTemplates.map((d) => d.labels)),
            ...flatMapDeep(existingTemplates.map((d) => d.labels)),
        ]);
    }),
});

const filterState = reactive({
    inputValue: '',
    selectedLabels: [] as string[],
    selectedProviders: [] as string[],
    selectedStartOption: 'templates',
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
        .filter((d) => d?.version !== '1.0')
        .filter((d) => (!_selectedLabels.length || d.labels?.some((label) => _selectedLabels.includes(label.toLowerCase()))))
        .filter((d) => (!_selectedProviders.length || d.labels?.some((label) => _selectedProviders.includes(label.toLowerCase()))))
        .filter((d) => (_inputValue === '' || d.name.toLowerCase().includes(_inputValue.toLowerCase())));
};

/* Event */
const handleSelectLabels = (labels: FilterLabelItem[]) => {
    filterState.selectedLabels = labels.map((d) => d.name.toLowerCase());
};
const handleSelectProvider = (providers: FilterLabelItem[]) => {
    filterState.selectedProviders = providers.map((d) => d.label.toLowerCase());
};
const handleSelectStartOption = (startOption: string) => {
    filterState.selectedStartOption = startOption;
    dashboardCreatePageStore.setSelectedOotbIdMap({});
    dashboardCreatePageStore.setSelectedExistingDashboardIdMap({});
};
const handleClickCancel = () => {
    router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE._NAME }));
};

onMounted(() => {
    dashboardCreatePageStore.listDashboardTemplates();
});
</script>

<template>
    <div class="dashboard-create-step-1">
        <div class="contents-container">
            <dashboard-create-step1-search-filter :labels="state.allExistingLabels"
                                                  @select-label="handleSelectLabels"
                                                  @select-provider="handleSelectProvider"
                                                  @select-start-option="handleSelectStartOption"
            />
            <div class="template-contents-area">
                <p-search :value.sync="filterState.inputValue"
                          class="search-wrapper"
                />
                <template v-if="filterState.selectedStartOption === 'templates'">
                    <dashboard-create-blank-board-item :template-sets="state.blankTemplate"
                                                       class="blank-board"
                    />
                    <p-field-title :label="i18n.t('DASHBOARDS.CREATE.OOTB_DASHBOARD')"
                                   class="field-title"
                                   required
                    />
                    <dashboard-folder-tree :selected-id-map="dashboardCreatePageState.selectedOotbIdMap"
                                           :dashboard-tree-data="state.ootbTemplateTreeData"
                                           hide-buttons
                                           @update:selectedIdMap="dashboardCreatePageStore.setSelectedOotbIdMap"
                    />
                </template>
                <dashboard-folder-tree v-else
                                       :selected-id-map="dashboardCreatePageState.selectedExistingDashboardIdMap"
                                       :dashboard-tree-data="state.existingDashboardTreeData"
                                       hide-buttons
                                       external-link
                                       @update:selectedIdMap="dashboardCreatePageStore.setSelectedExistingDashboardIdMap"
                />
                <p-empty v-if="!state.ootbTemplateTreeData.length && !state.existingDashboardTreeData.length"
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
    .contents-container {
        @apply flex gap-4;
        margin-top: 1.5rem;

        @screen tablet {
            @apply flex-col;
        }

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
                justify-content: end;
            }
        }
    }
}
</style>

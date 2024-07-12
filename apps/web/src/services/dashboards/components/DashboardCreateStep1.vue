<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { PEmpty, PFieldTitle, PSearch } from '@cloudforet/mirinae';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import type { DashboardTemplateModel } from '@/schema/repository/dashboard-template/model';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import type { FilterLabelItem } from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateTemplateBoard from '@/services/dashboards/components/DashboardCreateTemplateBoard.vue';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const state = reactive({
    templates: [] as DashboardTemplateModel[],
    blankTemplate: computed<BoardSet[]>(() => ([{
        template_id: 'blank',
        name: 'Blank',
    }])),
    outOfTheBoxTemplateSets: computed<BoardSet[]>(() => {
        const _filteredTemplates = getFilteredTemplates(dashboardCreatePageState.dashboardTemplates, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
        return _filteredTemplates.map((d) => ({
            template_id: d.template_id,
            name: d.name,
            labels: d.labels,
        }));
    }),
    existingTemplateSets: computed<BoardSet[]>(() => {
        const _filteredDashboards = getFilteredTemplates(dashboardGetters.allItems, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
        return _filteredDashboards.map((d) => ({
            dashboard_id: d.dashboard_id,
            name: d.name,
            labels: d.labels,
        }));
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

onMounted(() => {
    dashboardCreatePageStore.listDashboardTemplates();
});
</script>

<template>
    <div class="dashboard-create-step-1">
        <p-search :value.sync="filterState.inputValue" />
        <div class="contents-container">
            <dashboard-create-step1-search-filter @select-label="handleSelectLabels"
                                                  @select-provider="handleSelectProvider"
            />
            <div class="template-contents-area">
                <dashboard-create-template-board :template-sets="state.blankTemplate"
                                                 class="blank-board"
                >
                    <template #bottom>
                        <span class="blank-description">
                            {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}
                        </span>
                    </template>
                </dashboard-create-template-board>
                <p-empty v-if="!state.outOfTheBoxTemplateSets.length && !state.existingTemplateSets.length"
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
                <div v-if="state.outOfTheBoxTemplateSets.length"
                     class="out-of-the-box"
                >
                    <p-field-title class="title">
                        {{ $t('DASHBOARDS.CREATE.TEMPLATE.FIELD_OOTB_TEMPLATE') }}
                    </p-field-title>
                    <div class="out-of-the-box-contents">
                        <dashboard-create-template-board :template-sets="state.outOfTheBoxTemplateSets"
                                                         :column="2"
                                                         :keyword="filterState.inputValue"
                        />
                    </div>
                </div>
                <div v-if="state.existingTemplateSets.length"
                     class="existing"
                >
                    <p-field-title class="title">
                        {{ $t('DASHBOARDS.CREATE.TEMPLATE.FIELD_EXISTING_TEMPLATE') }}
                    </p-field-title>
                    <div class="existing-contents">
                        <dashboard-create-template-board :template-sets="state.existingTemplateSets"
                                                         show-view-link
                                                         :keyword="filterState.inputValue"
                        />
                    </div>
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

            .blank-board {
                padding-bottom: 2rem;
                .blank-description {
                    @apply text-paragraph-sm text-gray-500;
                }
            }
            .empty-template {
                padding-top: 3rem;
                .empty-image {
                    width: 5rem;
                    height: 5rem;
                }
            }

            .out-of-the-box {
                margin-bottom: 2rem;

                .out-of-the-box-contents {
                    margin-top: 0.5rem;
                }
            }

            .existing {

                .existing-contents {
                    margin-top: 0.5rem;
                }
            }
        }
    }
}
</style>

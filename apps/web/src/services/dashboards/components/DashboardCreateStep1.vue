<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PSearch, PFieldTitle, PEmpty,
} from '@spaceone/design-system';

import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import type {
    FilterLabelItem,
} from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateTemplateBoard from '@/services/dashboards/components/DashboardCreateTemplateBoard.vue';
import {
    generateDashboardTemplateList,
} from '@/services/dashboards/dashboard-template/template-list';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


const emit = defineEmits<{(e: 'select-template', value: DashboardModel)}>();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const state = reactive({
    managedTemplates: [] as DashboardTemplate[],
    blankTemplate: computed<DashboardTemplate[]>(() => ([{
        name: 'Blank',
        template_id: 'blank',
        template_type: 'MANAGED',
        version: '1',
        layouts: [],
        options: {
            date_range: {
                enabled: true,
            },
            refresh_interval_option: '5m',
        },
    }])),
    outOfTheBoxTemplateSets: computed<DashboardTemplate[]>(() => {
        const _templates = state.managedTemplates;
        return getFilteredTemplates(_templates, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
    }),
    existingTemplateSets: computed<DashboardTemplate[]>(() => {
        const _templates = dashboardGetters.allItems;
        const _filteredTemplates = _templates.filter((d) => d.version !== '1.0');
        return getFilteredTemplates(_filteredTemplates, filterState.inputValue, filterState.selectedLabels, filterState.selectedProviders);
    }),
});

const filterState = reactive({
    inputValue: '',
    selectedLabels: [] as FilterLabelItem[],
    selectedProviders: [] as FilterLabelItem[],
});

/* Util */
const getFilteredTemplates = (
    templates: DashboardTemplate[],
    inputValue: string,
    selectedLabels: FilterLabelItem[],
    selectedProviders: FilterLabelItem[],
): DashboardTemplate[] => {
    const _inputValue = inputValue.toLowerCase();
    return templates.filter((template) => (!selectedLabels.length || template.labels.some((label) => selectedLabels.map((sel) => sel.label).includes(label)))
        && (!selectedProviders.length || selectedProviders.some((provider) => template.variables_schema.fixed_options?.provider === provider.name))
        && (_inputValue === '' || template.name.toLowerCase().includes(_inputValue)));
};

/* Event */
const handleSelectLabels = (labels: FilterLabelItem[]) => {
    filterState.selectedLabels = labels;
};

const handleSelectProvider = (providers: FilterLabelItem[]) => {
    filterState.selectedProviders = providers;
};

const handleClickCreateTemplate = (template: DashboardModel) => {
    emit('select-template', template);
};

const listTemplates = async () => {
    state.managedTemplates = await generateDashboardTemplateList();
};

listTemplates();



</script>

<template>
    <div class="dashboard-create-step-1">
        <p-search :value.sync="filterState.inputValue" />
        <div class="contents-container">
            <dashboard-create-step1-search-filter @select-label="handleSelectLabels"
                                                  @select-provider="handleSelectProvider"
            />
            <div class="template-contents-area">
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
                <dashboard-create-template-board :template-sets="state.blankTemplate"
                                                 class="blank-board"
                                                 @select-template="handleClickCreateTemplate"
                >
                    <template #bottom>
                        <span class="blank-description">
                            {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}
                        </span>
                    </template>
                </dashboard-create-template-board>
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
                                                         @select-template="handleClickCreateTemplate"
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
                                                         @select-template="handleClickCreateTemplate"
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
                    background-color: rgba(225, 224, 250, 0.3);
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

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PSearch, PFieldTitle, PEmpty,
} from '@spaceone/design-system';

import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import type {
    TemplateLabelItem,
} from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateStep1SearchFilter from '@/services/dashboards/components/DashboardCreateStep1SearchFilter.vue';
import DashboardCreateTemplateBoard from '@/services/dashboards/components/DashboardCreateTemplateBoard.vue';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


const emit = defineEmits<{(e: 'select-template', value: DashboardModel)}>();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    outOfTheBoxTemplateSets: computed<DashboardTemplate[]>(() => {
        const _templates = Object.values(DASHBOARD_TEMPLATES);
        return getFilteredTemplates(_templates, filterState.inputValue, filterState.selectedLabels);
    }),
    existingTemplateSets: computed<DashboardTemplate[]>(() => {
        const _templates = dashboardGetters.allItems;
        return getFilteredTemplates(_templates, filterState.inputValue, filterState.selectedLabels);
    }),
});

const filterState = reactive({
    inputValue: '',
    selectedLabels: [] as TemplateLabelItem[],
});

/* Util */
const getFilteredTemplates = (templates: DashboardTemplate[], inputValue: string, selectedLabels: TemplateLabelItem[]): DashboardTemplate[] => {
    const _inputValue = inputValue.toLowerCase();
    return templates.filter((template) => (selectedLabels.length === 0 || template.labels.some((label) => selectedLabels.map((sel) => sel.label).includes(label)))
        && (_inputValue === '' || template.name.toLowerCase().includes(_inputValue)));
};

/* Event */
const handleSelectLabels = (labels: TemplateLabelItem[]) => {
    filterState.selectedLabels = labels;
};

const handleClickCreateTemplate = (template: DashboardModel) => {
    emit('select-template', template);
};

</script>

<template>
    <div class="dashboard-create-step-1">
        <p-search :value.sync="filterState.inputValue" />
        <div class="contents-container">
            <dashboard-create-step1-search-filter @select-label="handleSelectLabels" />
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
                <div v-if="state.outOfTheBoxTemplateSets.length"
                     class="out-of-the-box"
                >
                    <p-field-title class="title">
                        Out-of-the-Box Dashboard
                    </p-field-title>
                    <!--                    TODO: request non-opacity color-->
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
                        Existing Dashboard
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
                    @apply rounded-lg bg-violet-200;
                    padding: 0.75rem 0.75rem 0.875rem 0.75rem;
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

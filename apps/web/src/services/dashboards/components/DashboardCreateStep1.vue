<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PSearch, PFieldTitle,
} from '@spaceone/design-system';

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
    outOfTheBoxTemplateSets: computed(() => {
        const templates = Object.values(DASHBOARD_TEMPLATES);
        return templates.filter((template) => (filterState.selectedLabels.length === 0 || template.labels.some((label) => filterState.selectedLabels.map((sel) => sel.label).includes(label)))
            && (filterState.inputValue === '' || template.name.includes(filterState.inputValue)));
    }),
    exstingTemplateSets: computed(() => {
        const templates = dashboardGetters.allItems;
        return templates.filter((template) => (filterState.selectedLabels.length === 0 || template.labels.some((label) => filterState.selectedLabels.map((sel) => sel.label).includes(label)))
            && (filterState.inputValue === '' || template.name.includes(filterState.inputValue)));
    }),
});

const filterState = reactive({
    inputValue: '',
    selectedLabels: [] as TemplateLabelItem[],
});

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
                <div class="out-of-the-box">
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
                <div class="existing">
                    <p-field-title class="title">
                        Exsting Dashboard
                    </p-field-title>
                    <div class="exsting-contents">
                        <dashboard-create-template-board :template-sets="state.exstingTemplateSets"
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

                .exsting-contents {
                    margin-top: 0.5rem;
                }
            }
        }
    }
}
</style>

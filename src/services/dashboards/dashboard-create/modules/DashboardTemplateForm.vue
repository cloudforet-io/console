<template>
    <section>
        <p-pane-layout>
            <p-panel-top :title="$t('DASHBOARDS.CREATE.LABEL_START_FROM')" />
            <div class="dashboard-template-wrapper">
                <div class="dashboard-template-container">
                    <div class="card-container">
                        <span class="card-wrapper-title">
                            {{ $t('DASHBOARDS.CREATE.LABEL_DEFAULT_TEMPLATE') }}
                        </span>
                        <div class="card-wrapper">
                            <p-board
                                selectable
                                style-type="cards"
                                :style-options="{ column: 2 }"
                                :board-sets="state.defaultBoardSets"
                                @item-click="handleSelectTemplate"
                            >
                                <template #item-content="{board}">
                                    <strong>{{ board.name }}</strong>
                                    <div class="dashboard-label-wrapper">
                                        <p-label v-for="(label, idx) in board.labels"
                                                 :key="`board-${board.name}-label-${idx}`"
                                                 :text="label"
                                        />
                                    </div>
                                </template>
                            </p-board>
                            <p-text-pagination
                                :this-page="state.defaultTemplateThisPage"
                                :all-page="Math.ceil(state.defaultBoardSets.length / 10)"
                                @pageChange="handleChangePagination"
                            />
                        </div>
                    </div>
                    <div v-if="state.existingBoardSets.length"
                         class="card-container"
                    >
                        <span class="card-wrapper-title">
                            {{ $t('DASHBOARDS.CREATE.LABEL_EXISTING_DASHBOARD') }}
                        </span>
                        <div class="card-wrapper">
                            <p-board
                                selectable
                                style-type="cards"
                                :style-options="{ column: 2 }"
                                :board-sets="state.existingBoardSets"
                                @item-click="handleSelectTemplate"
                            >
                                <template #item-content="{board}">
                                    <strong>{{ board.name }}</strong>
                                    <div class="dashboard-label-wrapper">
                                        <p-label v-for="(label, idx) in board.labels"
                                                 :key="`board-${board.name}-label-${idx}`"
                                                 :text="label"
                                        />
                                    </div>
                                </template>
                            </p-board>
                        </div>
                    </div>
                </div>
            </div>
        </p-pane-layout>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PPaneLayout, PPanelTop, PBoard, PLabel, PTextPagination,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import type { DashboardConfig } from '@/services/dashboards/config';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';

const emit = defineEmits(['set-template']);


type dashboardTemplateBoardSet = DashboardConfig & { leftIcon: string, iconButtonSets: Array<any> };

const state = reactive({
    selectedTemplate: {} as DashboardConfig,
    defaultBoardSets: computed<dashboardTemplateBoardSet[]>(() => Object.values(DASHBOARD_TEMPLATES).map((d: DashboardConfig) => ({
        ...d,
        // below values are used only for render
        leftIcon: d.description?.preview_image ?? '',
        iconButtonSets: [{ iconName: 'ic_external-link', tooltipText: 'Preview', eventAction: () => {} }],
    }))),
    existingBoardSets: computed<BoardSet[]>(() => []),
    len: computed(() => state.defaultBoardSets.length),
    defaultTemplateThisPage: 1,
});


const handleSelectTemplate = (selectedTemplate: dashboardTemplateBoardSet) => {
    const _selectedTemplate: Partial<dashboardTemplateBoardSet> = { ...selectedTemplate };
    delete _selectedTemplate.leftIcon;
    delete _selectedTemplate.iconButtonSets;
    emit('set-template', _selectedTemplate);
};

const handleChangePagination = (page: number) => {
    if (page > state.defaultBoardSets.length) return;
    state.defaultTemplateThisPage = page;
};
</script>

<style lang="postcss" scoped>
.dashboard-template-wrapper {
    padding: 0.5rem 1rem 2.375rem 1rem;
    .dashboard-template-container {
        @apply bg-gray-100 border-gray-200;
        padding: 1rem 1rem 1.25rem;
        border-width: 1px;
        border-radius: 0.5rem;
        display: grid;
        grid-gap: 1rem;
        .card-wrapper-title {
            @apply text-gray-500 !important text-xs;
            font-weight: 700;
            margin-bottom: 0.5rem;
            display: block;
        }
        .text-pagination {
            @apply flex justify-center;
            margin: 0.75rem auto 0 auto;
        }
    }
}
</style>

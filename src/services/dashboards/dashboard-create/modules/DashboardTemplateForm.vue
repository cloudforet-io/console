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
                                :board-sets="defaultTemplateState.boardSets"
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
                                v-show="defaultTemplateState.allPage > 10"
                                :this-page="defaultTemplateState.thisPage"
                                :all-page="defaultTemplateState.allPage"
                                @pageChange="(page) => handleChangePagination(page, 'DEFAULT')"
                            />
                        </div>
                    </div>
                    <div class="card-container">
                        <span class="card-wrapper-title">
                            {{ $t('DASHBOARDS.CREATE.LABEL_EXISTING_DASHBOARD') }}
                        </span>
                        <div class="card-wrapper">
                            <p-search :value.sync="existingTemplateState.searchValue" />
                            <div class="existing-dashboard-board">
                                <p-board
                                    selectable
                                    style-type="cards"
                                    :style-options="{ column: 2 }"
                                    :board-sets="existingTemplateState.boardSets"
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
                                <p-empty v-show="!existingTemplateState.boardSets.length">
                                    No Items
                                </p-empty>
                            </div>
                            <p-text-pagination
                                :this-page="existingTemplateState.thisPage"
                                :all-page="existingTemplateState.allPage"
                                @pageChange="(page) => handleChangePagination(page, 'EXISTING')"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </p-pane-layout>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PPaneLayout, PPanelTop, PBoard, PLabel, PTextPagination, PSearch, PEmpty,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { DashboardConfig } from '@/services/dashboards/config';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';


const emit = defineEmits(['set-template']);

type DashboardTemplateBoardSet = DashboardConfig & { leftIcon: string, iconButtonSets: Array<any> };

const defaultTemplateState = reactive({
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(Object.values(DASHBOARD_TEMPLATES).length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => Object.values(DASHBOARD_TEMPLATES).map((d: DashboardConfig) => ({
        ...d,
        // below values are used only for render
        leftIcon: d.description?.preview_image ?? '',
        // song-lang
        iconButtonSets: [{ iconName: 'ic_external-link', tooltipText: 'Preview', eventAction: () => {} }],
    })).slice(10 * (defaultTemplateState.thisPage - 1), 10 * defaultTemplateState.thisPage - 1)),
});
const existingTemplateState = reactive({
    dashboards: computed<DashboardConfig[]>(() => [...store.state.dashboard.domainItems, ...store.state.dashboard.projectItems].filter((d) => d.name.includes(existingTemplateState.searchValue))),
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(existingTemplateState.dashboards.length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => existingTemplateState.dashboards.map((d: DashboardConfig) => ({
        ...d,
        // below values are used only for render
        leftIcon: d.description?.preview_image ?? '',
        // song-lang
        iconButtonSets: [{ iconName: 'ic_external-link', tooltipText: 'Preview', eventAction: () => {} }],
    })).slice(10 * (existingTemplateState.thisPage - 1), 10 * existingTemplateState.thisPage)),
    searchValue: '',
});

const handleSelectTemplate = (selectedTemplate: DashboardTemplateBoardSet) => {
    const _selectedTemplate: Partial<DashboardTemplateBoardSet> = { ...selectedTemplate };
    delete _selectedTemplate.leftIcon;
    delete _selectedTemplate.iconButtonSets;
    emit('set-template', _selectedTemplate as DashboardConfig);
};

const handleChangePagination = (page: number, type: 'DEFAULT'|'EXISTING'): void => {
    if (type === 'DEFAULT') {
        if (page > defaultTemplateState.boardSets.length) return;
        defaultTemplateState.thisPage = page;
    }
    if (type === 'EXISTING') {
        if (page > existingTemplateState.boardSets.length) return;
        existingTemplateState.thisPage = page;
    }
};

watch(() => existingTemplateState.searchValue, () => {
    existingTemplateState.thisPage = 1;
});

(async () => {
    await Promise.allSettled([
        store.dispatch('dashboard/loadProjectDashboard'),
        store.dispatch('dashboard/loadDomainDashboard'),
    ]);
})();
</script>

<style lang="postcss" scoped>
.dashboard-template-wrapper {
    padding: 0.5rem 1rem 2.375rem 1rem;
    .dashboard-template-container {
        @apply bg-gray-100 border-gray-200 grid gap-4;
        padding: 1rem 1rem 1.25rem;
        border-width: 1px;
        border-radius: 0.5rem;
        .card-wrapper-title {
            @apply text-gray-500 !important text-xs block;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .existing-dashboard-board {
            @apply relative;
            min-height: 27rem;

            @screen tablet {
                min-height: 54.5rem;
            }

            @screen mobile {
                min-height: 54.5rem;
            }
        }
        .p-empty {
            @apply absolute;
        }
        .p-search {
            margin-bottom: 8px;
        }
        .text-pagination {
            @apply flex justify-center;
            margin: 0.75rem auto 0 auto;
        }
    }
}

/* custom design-system component - p-board-item */
:deep(.p-board-item) {
    min-height: 5rem;
}
</style>

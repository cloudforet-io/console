<template>
    <div class="dashboard-template-wrapper">
        <p-search
            :value.sync="state.searchValue"
            @update:value="handleInputSearch"
        />
        <div class="dashboard-template-container">
            <div class="card-container default-dashboard-board">
                <span class="card-wrapper-title">
                    {{ $t('DASHBOARDS.CREATE.LABEL_DEFAULT_TEMPLATE') }}
                </span>
                <div class="card-wrapper">
                    <p-board
                        selectable
                        style-type="cards"
                        :style-options="{ column: 3 }"
                        :board-sets="defaultTemplateState.boardSets"
                        :selected-item="state.selectedTemplateName"
                        @item-click="handleSelectTemplate"
                    >
                        <template #item-content="{board}">
                            <div class="content-layout">
                                <p-i :name="board.description.icon"
                                     width="2.5rem"
                                     height="2.5rem"
                                />
                                <strong class="dashboard-name">{{ board.name }}</strong>
                                <div class="dashboard-label-wrapper">
                                    <p-label v-for="(label, idx) in board.labels"
                                             :key="`board-${board.name}-label-${idx}`"
                                             :text="label"
                                             :click-stop="false"
                                    />
                                </div>
                                <span class="dashboard-description-text">{{ board.description.text }}</span>
                            </div>
                        </template>
                        <template #item-overlay-content="{board}">
                            <router-link
                                v-if="board.description?.preview_image"
                                :to="`/images/dashboard-previews/dashboard-img_${board.description?.preview_image}--thumbnail.png`"
                                target="_blank"
                            >
                                <div class="dashboard-template-overlay-content">
                                    <span class="dashboard-template-overlay-preview">{{ $t('DASHBOARDS.CREATE.PREVIEW') }}</span>
                                    <p-i name="ic_external-link"
                                         height="1em"
                                         width="1em"
                                    />
                                </div>
                            </router-link>
                        </template>
                    </p-board>
                    <p-empty
                        v-show="!defaultTemplateState.boardSets.length"
                        show-image
                    >
                        {{ $t('DASHBOARDS.CREATE.NO_DATA') }}
                    </p-empty>
                    <p-text-pagination
                        v-show="defaultTemplateState.allPage >= 2"
                        :this-page="defaultTemplateState.thisPage"
                        :all-page="defaultTemplateState.allPage"
                        @pageChange="handleChangePagination($event, TEMPLATE_TYPE.EXISTING)"
                    />
                </div>
            </div>
            <div class="card-container existing-dashboard-board">
                <span class="card-wrapper-title">
                    {{ $t('DASHBOARDS.CREATE.LABEL_EXISTING_DASHBOARD') }}
                </span>
                <div class="card-wrapper">
                    <p-board
                        selectable
                        style-type="cards"
                        :board-sets="existingTemplateState.boardSets"
                        :selected-item="state.selectedTemplateName"
                        @item-click="handleSelectTemplate"
                    >
                        <template #item-content="{board}">
                            <div class="content-layout">
                                <strong class="dashboard-name">{{ board.name }}</strong>
                                <div class="dashboard-info">
                                    {{ board.groupLabel }}
                                </div>
                                <div v-if="board.labels.length > 0"
                                     class="dashboard-label-wrapper"
                                >
                                    <p-label v-for="(label, idx) in board.labels"
                                             :key="`board-${board.name}-label-${idx}`"
                                             :text="label"
                                             :click-stop="false"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #item-overlay-content="{board}">
                            <div class="dashboard-template-overlay-content"
                                 @click="handleOpenDashboardNewTab(board)"
                            >
                                <span class="dashboard-template-overlay-preview">{{ $t('DASHBOARDS.CREATE.PREVIEW') }}</span>
                                <p-i name="ic_external-link"
                                     height="1em"
                                     width="1em"
                                />
                            </div>
                        </template>
                    </p-board>
                    <p-empty
                        v-show="!existingTemplateState.boardSets.length"
                        show-image
                    >
                        {{ $t('DASHBOARDS.CREATE.NO_DATA') }}
                    </p-empty>
                    <p-text-pagination
                        v-show="existingTemplateState.allPage >= 2"
                        :this-page="existingTemplateState.thisPage"
                        :all-page="existingTemplateState.allPage"
                        @pageChange="handleChangePagination($event, TEMPLATE_TYPE.EXISTING)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PBoard, PLabel, PTextPagination, PSearch, PEmpty, PI,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';


import type { DashboardConfig, DashboardScope } from '@/services/dashboards/config';
import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/default-dashboard/template-list';
import type { DashboardModel, DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DOMAIN_SCOPE_NAME = 'Workspace';
const emit = defineEmits(['set-template']);

type DashboardTemplateBoardSet = DashboardConfig & { value: string };

const TEMPLATE_TYPE = { DEFAULT: 'DEFAULT', EXISTING: 'EXISTING' };
type TemplateType = typeof TEMPLATE_TYPE[keyof typeof TEMPLATE_TYPE];
interface Props {
    dashboardScope: DashboardScope;
}

const props = defineProps<Props>();

const state = reactive({
    selectedTemplateName: '',
    searchValue: '',
});
const defaultTemplateState = reactive({
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(Object.values(DASHBOARD_TEMPLATES).length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => Object.values(DASHBOARD_TEMPLATES)
        .map((d: DashboardConfig) => ({
            ...d,
            // below values are used only for render
            value: `${TEMPLATE_TYPE.DEFAULT}-${d.name}`,
        }))
        .filter((d) => d.name.includes(state.searchValue))
        .slice(10 * (defaultTemplateState.thisPage - 1), 10 * defaultTemplateState.thisPage - 1)),
});
const existingTemplateState = reactive({
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(existingTemplateState.dashboards.length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => existingTemplateState.dashboards
        .map((d: DomainDashboardModel & ProjectDashboardModel) => {
            const isProjectDashboard = Object.prototype.hasOwnProperty.call(d, 'project_dashboard_id');
            return {
                ...d,
                // below values are used only for render
                value: `${TEMPLATE_TYPE.EXISTING}-${d.name}-${isProjectDashboard ? d.project_dashboard_id : d.domain_dashboard_id}`,
                groupLabel: existingTemplateState.projectItems[d.project_id]?.label || existingTemplateState.groupLabel,
            };
        })
        .slice(10 * (existingTemplateState.thisPage - 1), 10 * existingTemplateState.thisPage)),
    projectItems: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    groupLabel: computed<string>(() => {
        if (props.dashboardScope === DASHBOARD_SCOPE.DOMAIN) return DOMAIN_SCOPE_NAME;
        return '';
    }),
    dashboards: computed<DashboardModel[]>(() => {
        let dashboardItems;
        if (props.dashboardScope === DASHBOARD_SCOPE.DOMAIN) dashboardItems = store.state.dashboard.domainItems;
        else dashboardItems = store.state.dashboard.projectItems;

        return dashboardItems.filter((d) => d.name.includes(state.searchValue));
    }),

});

const handleOpenDashboardNewTab = (board: DashboardModel) => {
    const isProjectDashboard = Object.prototype.hasOwnProperty.call(board, 'project_dashboard_id');
    const routeName = isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
    const { href } = SpaceRouter.router.resolve({
        name: routeName,
        params: {
            dashboardId: isProjectDashboard
                ? (board as ProjectDashboardModel).project_dashboard_id
                : (board as DomainDashboardModel).domain_dashboard_id,
        },
    });
    window.open(href, '_blank');
};

const handleSelectTemplate = (selectedTemplate: DashboardTemplateBoardSet) => {
    state.selectedTemplateName = selectedTemplate.value;
    const _selectedTemplate: Partial<DashboardTemplateBoardSet> = { ...selectedTemplate };
    emit('set-template', _selectedTemplate as DashboardModel);
};

const handleChangePagination = (page: number, type: TemplateType): void => {
    if (type === TEMPLATE_TYPE.DEFAULT) defaultTemplateState.thisPage = page;
    if (type === TEMPLATE_TYPE.EXISTING) existingTemplateState.thisPage = page;
};

const handleInputSearch = () => {
    existingTemplateState.thisPage = 1;
};

(async () => {
    await Promise.allSettled([
        store.dispatch('dashboard/loadProjectDashboard'),
        store.dispatch('dashboard/loadDomainDashboard'),
    ]);
})();
</script>

<style lang="postcss" scoped>
.dashboard-template-wrapper {
    @apply relative;
    .dashboard-template-container {
        @apply overflow-auto;
        height: calc(100vh - $gnb-height - 2.5rem - 6.5rem - 2rem - 4.5rem - 4.1rem);
        padding-bottom: 2.5rem;
        &::after {
            @apply w-full absolute;
            height: 2.5rem;
            content: '';
            bottom: 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 100%);
        }
        .card-container {
            @apply mt-6;
        }
        .card-wrapper-title {
            @apply text-gray-500 !important text-xs block;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .dashboard-name {
            @apply text-sm block;
        }
        .dashboard-info {
            @apply text-label-sm text-gray-500;
        }
        .dashboard-description-text {
            @apply text-gray-500 text-xs;
        }
        .dashboard-template-overlay-content {
            @apply text-blue-700;
            height: 1.5rem;
        }
        .dashboard-template-overlay-preview {
            @apply text-sm mr-1;
        }
        .p-empty {
            padding-top: 3.25rem;
        }
        .p-search {
            margin-bottom: 8px;
        }
        .text-pagination {
            @apply flex justify-center;
            margin: 0.75rem auto 0 auto;
        }

        .default-dashboard-board {
            .content-layout {
                @apply flex flex-col items-center;
            }
            .dashboard-name {
                margin: 0.375rem 0;
            }

            @screen tablet {
                .content-layout {
                    @apply relative items-start;
                    padding-left: 3.25rem;
                    min-height: 2.5rem;
                    .p-i-icon {
                        @apply absolute;
                        left: 0;
                    }
                }
                .dashboard-name {
                    margin: 0;
                }
            }
        }

        .existing-dashboard-board {
            @apply relative;

            .content-layout {
                @apply flex flex-col row-gap-1;
            }
            .p-board {
                min-height: 4.125rem;
            }
        }
    }
}
</style>

<script setup lang="ts">
import {
    computed, reactive, ref,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PBoard, PLabel, PTextPagination, PSearch, PEmpty, PI, getTextHighlightRegex, PLink,
} from '@spaceone/design-system';

import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { ADMIN_DASHBOARD_TEMPLATES, DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


const emit = defineEmits(['set-template']);

type DashboardTemplateBoardSet = DashboardTemplate & { value: string };

const TEMPLATE_TYPE = { DEFAULT: 'DEFAULT', EXISTING: 'EXISTING' };
type TemplateType = typeof TEMPLATE_TYPE[keyof typeof TEMPLATE_TYPE];
interface Props {
    dashboardScope?: DashboardScope;
}

const props = defineProps<Props>();

const templateContainerRef = ref<HTMLElement | null>(null);

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    selectedTemplateName: `${TEMPLATE_TYPE.DEFAULT}-${DASHBOARD_TEMPLATES.monthlyCostSummary.name}`,
    searchValue: '',
});

const defaultTemplateState = reactive({
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(Object.values(DASHBOARD_TEMPLATES).length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => {
        const regex = getTextHighlightRegex(state.searchValue);
        const templates = storeState.isAdminMode ? ADMIN_DASHBOARD_TEMPLATES : DASHBOARD_TEMPLATES;
        return Object.values(templates)
            .map((d: DashboardTemplate) => ({
                ...d,
                // below values are used only for render
                value: `${TEMPLATE_TYPE.DEFAULT}-${d.name}`,
            }))
            .filter((d) => regex.test(d.name))
            .slice(10 * (defaultTemplateState.thisPage - 1), 10 * defaultTemplateState.thisPage - 1);
    }),
});
const existingTemplateState = reactive({
    thisPage: 1,
    allPage: computed<number>(() => Math.ceil(existingTemplateState.dashboards.length / 10) || 1),
    boardSets: computed<DashboardTemplateBoardSet[]>(() => existingTemplateState.dashboards
        .map((d: DashboardModel) => ({
            ...d,
            // below values are used only for render
            value: `${TEMPLATE_TYPE.EXISTING}-${d.name}-${d.public_dashboard_id || d.private_dashboard_id}`,
            groupLabel: existingTemplateState.projectItems[d.project_id]?.label || existingTemplateState.groupLabel,
        }))
        .slice(10 * (existingTemplateState.thisPage - 1), 10 * existingTemplateState.thisPage)),
    projectItems: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    groupLabel: computed<string>(() => {
        if (props.dashboardScope === 'WORKSPACE') return 'Workspace';
        return '';
    }),
    dashboards: computed<DashboardModel[]>(() => {
        let dashboardItems: DashboardModel[] = [];
        if (storeState.isAdminMode) dashboardItems = dashboardGetters.domainItems;
        else if (props.dashboardScope === 'WORKSPACE') dashboardItems = dashboardGetters.workspaceItems;
        else if (props.dashboardScope === 'PROJECT') dashboardItems = dashboardGetters.projectItems;

        return dashboardItems.filter((d) => d.name.includes(state.searchValue));
    }),

});

const getDashboardLocation = (board: DashboardModel): Location => ({
    name: DASHBOARDS_ROUTE.DETAIL._NAME,
    params: {
        dashboardId: board.public_dashboard_id || board.private_dashboard_id,
    },
});

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
    handleSelectTemplate(defaultTemplateState.boardSets[0]);
})();
</script>

<template>
    <div class="dashboard-template-wrapper">
        <p-search
            :value.sync="state.searchValue"
            @update:value="handleInputSearch"
        />
        <div
            ref="templateContainerRef"
            class="dashboard-template-container"
        >
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
                            <p-link v-if="board.description?.preview_image"
                                    action-icon="internal-link"
                                    size="md"
                                    highlight
                                    new-tab
                                    :text="$t('DASHBOARDS.CREATE.PREVIEW')"
                                    :href="`/images/dashboard-previews/dashboard-img_${board.description?.preview_image}--thumbnail.png`"
                            />
                        </template>
                    </p-board>
                    <p-text-pagination
                        v-show="defaultTemplateState.allPage >= 2"
                        :this-page="defaultTemplateState.thisPage"
                        :all-page="defaultTemplateState.allPage"
                        @pageChange="handleChangePagination($event, TEMPLATE_TYPE.EXISTING)"
                    />
                </div>
            </div>
            <div v-if="existingTemplateState.boardSets.length"
                 class="card-container existing-dashboard-board"
            >
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
                            <p-link class="legend"
                                    action-icon="internal-link"
                                    new-tab
                                    highlight
                                    :text="$t('DASHBOARDS.CREATE.VIEW')"
                                    :to="getDashboardLocation(board)"
                            />
                        </template>
                    </p-board>
                    <p-text-pagination
                        v-show="existingTemplateState.allPage >= 2"
                        :this-page="existingTemplateState.thisPage"
                        :all-page="existingTemplateState.allPage"
                        @pageChange="handleChangePagination($event, TEMPLATE_TYPE.EXISTING)"
                    />
                </div>
            </div>
            <p-empty
                v-show="!defaultTemplateState.boardSets.length && !existingTemplateState.boardSets.length"
                show-image
            >
                {{ $t('DASHBOARDS.CREATE.NO_DATA') }}
            </p-empty>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-template-wrapper {
    @apply relative;
    .dashboard-template-container {
        @apply overflow-auto;
        .card-container {
            @apply mt-6;
            .legend {
                @apply text-label-md;
            }
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

    @screen tablet {
        .dashboard-template-container {
            .default-dashboard-board {
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
    }
}
</style>

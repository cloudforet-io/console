<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PSkeleton, PSelectDropdown, PI, PBadge, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { BadgeStyleType, BadgeType } from '@cloudforet/mirinae/types/data-display/badge/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import { i18n } from '@/translations';


import { gray } from '@/styles/colors';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import { useDashboardControlMenuHelper } from '@/services/_shared/dashboard/core/composables/use-dashboard-control-menu-helper';
import DashboardControlButtons from '@/services/_shared/dashboard/dashboard-detail/components/DashboardControlButtons.vue';
import DashboardLabelsButton from '@/services/_shared/dashboard/dashboard-detail/components/DashboardLabelsButton.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';

interface Props {
    dashboardId: string;
    folderItems: Array<FolderModel>;
}
const props = withDefaults(defineProps<Props>(), {
    folderItems: () => [],
});
const emit = defineEmits<{(e: 'select-toolset', toolsetId: string|undefined): void;}>();
const { isAdminMode, entryPoint } = useDashboardSharedContext();

const { dashboard } = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});
const { getDashboardManageable } = useDashboardManageable();
const dashboardManageable = computed(() => getDashboardManageable(dashboard.value));

const { getControlDashboardMenuItems } = useDashboardControlMenuHelper();
const controlMenuItems = computed<MenuItem[]>(() => {
    if (!dashboard.value) return [];
    return getControlDashboardMenuItems(props.dashboardId, dashboardManageable.value, dashboard.value, entryPoint.value === 'PROJECT');
});

const state = reactive({
    isPrivate: computed<boolean>(() => !!dashboard.value?.dashboard_id.startsWith('private')),
    isSharedDashboard: computed<boolean>(() => !!dashboard.value?.shared),
    showBadge: computed<boolean>(() => {
        if (dashboard.value?.user_id) return true;
        return state.isSharedDashboard;
    }),
    badgeType: computed<BadgeType>(() => 'subtle'),
    badgeStyleType: computed<BadgeStyleType>(() => {
        if (state.isPrivate) return 'gray150';
        return 'indigo100';
    }),
    badgeText: computed(() => {
        if (props.dashboardId?.startsWith('private')) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        if (state.isSharedDashboard) {
            if (entryPoint.value === 'DASHBOARDS') {
                if (isAdminMode.value) {
                    if (dashboard.value?.scope === 'PROJECT') {
                        return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
                    }
                    return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
                }
                if (dashboard.value?.resource_group === RESOURCE_GROUP.DOMAIN) {
                    return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
                }
                if (dashboard.value?.scope === 'PROJECT') {
                    return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
                }
            }
            if (entryPoint.value === 'PROJECT') {
                if (dashboard.value?.resource_group === RESOURCE_GROUP.DOMAIN) return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
                return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_WORKSPACE');
            }
        }
        return '';
    }),
    folderName: computed<string|undefined>(() => {
        if (props.folderItems.length > 0) {
            const currentFolder = props.folderItems.find((d) => d.folder_id === dashboard.value?.folder_id);
            return currentFolder?.name;
        }
        return undefined;
    }),
});

/* Event */
const handleSelectItem = (item: MenuItem) => {
    emit('select-toolset', item.name);
};
</script>

<template>
    <div class="dashboard-detail-header"
         :class="{ 'project-dashboard': entryPoint === 'PROJECT' }"
    >
        <div v-if="state.folderName"
             class="folder-name-wrapper"
        >
            <p-i name="ic_folder"
                 width="1rem"
                 height="1rem"
                 :color="gray[600]"
            />
            <span class="folder-name">{{ state.folderName }}</span>
        </div>
        <p-heading-layout class="detail-heading-layout">
            <template #heading>
                <p-heading :title="dashboard?.name">
                    <p-skeleton v-if="!dashboard?.name"
                                width="20rem"
                                height="1.5rem"
                    />
                    <template #title-right-extra>
                        <p-badge v-if="state.showBadge"
                                 :badge-type="state.badgeType"
                                 :style-type="state.badgeStyleType"
                                 class="mr-2"
                        >
                            <p-i v-if="state.isPrivate"
                                 name="ic_lock-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="gray900"
                                 class="mr-1"
                            />
                            {{ state.badgeText }}
                        </p-badge>
                        <p-select-dropdown class="dashboard-setting-dropdown"
                                           style-type="tertiary-icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           size="sm"
                                           :menu="controlMenuItems"
                                           :selected="[]"
                                           use-fixed-menu-style
                                           reset-selection-on-menu-close
                                           @select="handleSelectItem"
                        />
                        <dashboard-labels-button class="label-button"
                                                 :dashboard-id="props.dashboardId"
                        />
                    </template>
                </p-heading>
            </template>
            <template v-if="dashboard?.version !== '1.0'"
                      #extra
            >
                <dashboard-control-buttons v-if="dashboardManageable"
                                           :dashboard-id="props.dashboardId"
                                           :name="dashboard?.name"
                />
            </template>
        </p-heading-layout>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-header {
    &.project-dashboard {
        padding: 2rem 1.5rem 0;
        .detail-heading-layout {
            @apply mb-0;
        }
    }
    margin-bottom: 0.75rem;

    .detail-heading-layout {
        @apply mb-6;
    }
    .folder-name-wrapper {
        display: flex;
        align-items: center;
        .folder-name {
            @apply text-paragraph-sm text-gray-600;
            margin-left: 0.125rem;
        }
    }
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 2.5rem;
    }
    .label-button {
        display: inline-flex;
        margin-left: 0.5rem;
    }
}
.select-card-wrapper {
    @apply grid grid-cols-12;
    gap: 0.5rem;
    .p-select-card {
        @apply col-span-6;
    }
}
</style>

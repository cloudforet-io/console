<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PI, PIconButton, PTreeItem,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import NewMark from '@/common/components/marks/NewMark.vue';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray, indigo, violet } from '@/styles/colors';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';


interface Props {
    treeData: TreeNode<DashboardTreeDataType>;
    hideButtons?: boolean;
    externalLink?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits<{(e: 'toggle-folder'): void;
}>();
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardMainPageStore = useDashboardMainPageStore();
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    folderControlButtons: computed(() => {
        if (props.hideButtons) return [];
        const _defaultButtons = [{
            name: 'edit',
            icon: 'ic_edit-text',
            clickEvent: handleEditFolderName,
        }];
        if (props.treeData.data.id.startsWith('private')) {
            return _defaultButtons;
        }
        return [
            ..._defaultButtons,
            {
                name: 'share',
                icon: 'ic_share',
                clickEvent: handleShareFolder,
            },
        ];
    }),
});

/* Util */
const getSharedColor = (node: TreeNode<DashboardTreeDataType>): string|undefined => {
    if (node.data.shared) {
        if (node.data.projectId === '*') return violet[500];
        return indigo[500];
    }
    return undefined;
};
const getSharedText = (node: TreeNode<DashboardTreeDataType>): TranslateResult|undefined => {
    if (node.data.shared) {
        if (state.isAdminMode) {
            if (node.data.projectId === '*') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
        }
        if (node.data.projectId === '*') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
    }
    return undefined;
};

/* Event */
const handleClickTreeItem = (): void => {
    if (props.treeData.data.type === 'FOLDER') {
        emit('toggle-folder');
        return;
    }
    const _target = props.externalLink ? '_blank' : '_self';
    window.open(router.resolve(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: props.treeData.data.id || '',
        },
    })).href, _target);
};
const handleEditFolderName = () => {
    dashboardMainPageStore.setFolderFormModalType('UPDATE');
    dashboardMainPageStore.setSelectedFolderId(props.treeData.data.id);
    dashboardMainPageStore.setFolderFormModalVisible(true);
};
const handleShareFolder = () => {
    dashboardMainPageStore.setSelectedFolderId(props.treeData.data.id);
    dashboardMainPageStore.setFolderShareModalVisible(true);
};
</script>

<template>
    <p-tree-item :node="props.treeData"
                 class="dashboard-folder-tree-item"
    >
        <template #content="{ node }">
            <div class="dashboard-folder-tree-item-content"
                 @click="handleClickTreeItem"
            >
                <div class="contents-wrapper">
                    <div class="left-part">
                        <p-i class="dashboard-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder' : 'ic_service_dashboard'"
                             :color="gray[600]"
                             width="1rem"
                             height="1rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                        <div v-if="node.data.isNew">
                            <new-mark class="new-mark" />
                        </div>
                        <p-i v-if="node.data.type === 'DASHBOARD' && props.externalLink"
                             name="ic_arrow-right-up"
                             width="0.75rem"
                             height="0.75rem"
                        />
                        <div class="hidden-wrapper">
                            <favorite-button v-if="node.data.type === 'DASHBOARD' && !props.hideButtons"
                                             :item-id="node.data.id"
                                             :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                             scale="0.8"
                            />
                            <span v-if="node.data.shared"
                                  class="shared-text"
                                  :style="{'color': getSharedColor(node)}"
                            >- {{ getSharedText(node) }}</span>
                            <span v-if="node.data.createdBy"
                                  class="created-by-text"
                            >
                                - {{ i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.CREATED_BY', { user: node.data.createdBy }) }}
                            </span>
                        </div>
                    </div>
                    <div class="right-part">
                        <template v-if="props.treeData.data.type === 'FOLDER'">
                            <p-icon-button v-for="controlButton in state.folderControlButtons"
                                           :key="`folder-control-button-${node.data.id}-${controlButton.name}`"
                                           :name="controlButton.icon"
                                           size="sm"
                                           style-type="tertiary"
                                           shape="square"
                                           class="hidden-wrapper"
                                           @click.stop="controlButton.clickEvent"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </p-tree-item>
</template>

<style lang="postcss" scoped>
.dashboard-folder-tree-item {
    .dashboard-folder-tree-item-content {
        padding: 0.5rem 0;
        .contents-wrapper {
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .left-part {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                .dashboard-icon {
                    min-width: 0.875rem;
                }
                .text {
                    @apply text-gray-900;
                    font-size: 0.875rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .new-mark {
                    margin-left: 0;
                }
            }
            .right-part {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
        }
    }
    .hidden-wrapper {
        display: flex;
        gap: 0.25rem;
        align-items: center;
        visibility: hidden;
        .shared-text {
            @apply text-label-sm;
        }
        .created-by-text {
            @apply text-label-sm text-gray-500;
        }
    }
    &:hover {
        .hidden-wrapper {
            visibility: visible;
        }
    }
}
</style>

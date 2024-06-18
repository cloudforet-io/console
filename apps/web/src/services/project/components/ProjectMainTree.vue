<script setup lang="ts">

import { asyncComputed } from '@vueuse/core';
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRoute } from 'vue-router/composables';

import { PI, PTreeView } from '@spaceone/design-system';
import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
// import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
// import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
// import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { indigo, peacock } from '@/styles/colors';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectTreeStore } from '@/services/project/stores/project-tree-store';
import type { TreeNode, TreeDisplayMap } from '@/services/project/tree/type';

interface ProjectDataType {
    name: string;
    type: 'PROJECT'|'PROJECT_GROUP';
    id: string;
    parentGroupId?: string;
}

const route = useRoute();
// const gnbStore = useGnbStore();

const allReferenceStore = useAllReferenceStore();
const { getProperRouteLocation } = useProperRouteLocation();
const projectTreeStore = useProjectTreeStore();
const projectTreeState = projectTreeStore.state;

const storeState = reactive({
    projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    treeDisplayMap: computed(() => projectTreeState.treeDisplayMap),
});

const state = reactive({
    selectedTreeId: undefined as string|undefined,
    proejctGroupData: computed<ProjectDataType[]>(() => Object.entries(storeState.projectGroup).map(([key, value]) => ({
        name: value.name,
        type: 'PROJECT_GROUP',
        id: key,
        parentGroupId: value.data.parentGroupInfo?.id,
    }))),
    projectTreeData: asyncComputed<TreeNode[]>(async () => {
        if (!state.proejctGroupData.length) return [];
        const initialProjectGroupData: ProjectDataType[] = getProjectGroupListDataById();
        const initialProjectData: ProjectDataType[] = await getProjectData();
        const initialData = [...initialProjectGroupData, ...initialProjectData];
        const result = await convertItemsToTreeData(initialData, 0, storeState.treeDisplayMap);
        return result;
    }, [], { lazy: true }),
});

//
// watch(() => state.projectGroupNavigation, async (projectGroupNavigation) => {
//     gnbStore.setBreadcrumbs(projectGroupNavigation);
// });

/* Event */
const handleUpdateTreeDisplayMap = (treeDisplayMap: TreeDisplayMap) => {
    if (isEqual(treeDisplayMap, storeState.treeDisplayMap)) return;
    projectTreeStore.setTreeDisplayMap(treeDisplayMap);
};

/* Helper */
const getProjectGroupListDataById = (id?: string): ProjectDataType[] => state.proejctGroupData.filter((item) => item.parentGroupId === id);
const convertItemsToTreeData = async (items: ProjectDataType[], depth: number, treeDisplayMap: Record<string, { isOpen: boolean }>): Promise<TreeNode[]> => {
    const result = await Promise.all(items.map(async (item) => {
        let childrensData: ProjectDataType[] = [];
        const loadChild = treeDisplayMap[item.id] ? treeDisplayMap[item.id].isOpen : false;
        if (loadChild) {
            const childProjectGroupItems = getProjectGroupListDataById(item.id);
            const childProjectItems = await getProjectData(item.id);
            childrensData = [...childProjectGroupItems, ...childProjectItems];
        }

        const treeItem = {
            id: item.id,
            depth,
            isOpen: false,
            data: {
                ...item,
                to: getProperRouteLocation(convertProjectTreeNodeToLocation(item)),
            },
            children: item.type === 'PROJECT' ? undefined : await convertItemsToTreeData(childrensData, depth + 1, treeDisplayMap),
        };
        return treeItem;
    }));
    return result;
};


const convertProjectTreeNodeToLocation = (item: ProjectDataType): Location => (item.type === 'PROJECT' ? {
    name: PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME,
    params: {
        id: item.id,
    },
} : {
    name: PROJECT_ROUTE._NAME,
    params: {
        projectGroupId: item.id,
    },
});

const getProjectData = async (projectGroupId?: string): Promise<ProjectDataType[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>({
            project_group_id: projectGroupId,
        });
        const convertedData = (results ?? []).filter((item) => (projectGroupId ? true : !item.project_group_id)).map((project) => ({
            name: project.name,
            type: 'PROJECT' as ProjectDataType['type'],
            id: project.project_id,
            parentGroupId: project.project_group_id,
        }));

        return convertedData;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

onMounted(() => {
    const selectedTreeId = (route.params.projectGroupId || route.params.id) as string|undefined;
    if (selectedTreeId) {
        state.selectedTreeId = selectedTreeId as string;
        // setSelectedNodeId(selectedTreeId);
    }
});

watch(() => state.projectTreeData, (projectTreeData) => {
    console.debug('[ASYNC] watch projectTreeData', projectTreeData);
});

</script>

<template>
    <div class="project-main-tree">
        <p-tree-view :tree-data="state.projectTreeData"
                     :tree-display-map="storeState.treeDisplayMap"
                     :selected-id="state.selectedTreeId"
                     @update:tree-display-map="handleUpdateTreeDisplayMap"
        >
            <template #content="{ node }">
                <div class="project-menu-item-content">
                    <div class="contents-wrapper">
                        <p-i class="project-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder-filled' : 'ic_document-filled'"
                             :color="Array.isArray(node.children) ? indigo[500] : peacock[600]"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                    </div>
                    <favorite-button :item-id="node.id"
                                     :favorite-type="Array.isArray(node.children) ? FAVORITE_TYPE.PROJECT_GROUP : FAVORITE_TYPE.PROJECT"
                                     scale="0.8"
                                     class="favorite-button"
                    />
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    .project-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply flex items-center gap-1 w-full;

            .project-icon {
                min-width: 0.875rem;
            }
            .text {
                @apply text-label-md text-gray-900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .favorite-button {
            display: none;
            min-width: 1.5rem;
            height: 1rem;
            padding-left: 0.5rem;
        }

        &:hover {
            .contents-wrapper {
                width: calc(100% - 1.5rem);
            }
            .favorite-button {
                display: block;
            }
        }
    }
}
</style>

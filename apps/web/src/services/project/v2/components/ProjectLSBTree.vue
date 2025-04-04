<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ProjectLSBTree',
});
</script>
<script setup lang="ts">
/* eslint-disable import/first */
import {
    computed,
    ref,
    watch,
// eslint-disable-next-line import/no-duplicates
} from 'vue';

import { PTreeNode } from '@cloudforet/mirinae';
import type { TreeNodeIcon, TreeNodeRoutePredicate } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo } from '@/styles/colors';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';

const props = withDefaults(defineProps<{
    parentGroupId?: string;
    depth?: number;
    selectedPaths?: string[];
}>(), {
    parentGroupId: undefined,
    depth: 0,
    selectedPaths: () => [],
});

/* items */
const projectListStore = useProjectListStore();
const items = computed(() => projectListStore.getItemsByParentGroupId(props.parentGroupId));

/* icons */
const projectGroupIcon: TreeNodeIcon = { iconName: 'ic_folder-filled', iconColor: indigo[500] };
const projectIcon: TreeNodeIcon = 'ic_project-filled';

/* link */
const predicate: TreeNodeRoutePredicate = (to, curr) => to.params?.projectGroupOrProjectId === curr.params.projectGroupOrProjectId;

/* expanded */
const expandedMap = ref<Record<string, boolean>>({});
const getExpanded = (key: string) => props.selectedPaths.includes(key) && props.depth < props.selectedPaths.length - 1;
watch(items, (nodes) => {
    const map = {};
    nodes.forEach((node) => {
        map[node.key] = expandedMap.value[node.key] ?? getExpanded(node.key);
    });
    expandedMap.value = map;
});
watch(() => props.selectedPaths, (paths) => {
    const map = { ...expandedMap.value };
    paths.forEach((path, index) => {
        if (index < paths.length - 1) {
            map[path] = true;
        }
    });
    expandedMap.value = map;
}, { immediate: true });
</script>

<template>
    <div class="project-main-tree">
        <p-tree-node v-for="item in items"
                     :id="item.key"
                     :key="item.key"
                     :data-node-id="item.key"
                     :name="item.name"
                     :depth="props.depth"
                     :selectable="true"
                     :link="{
                         to: {
                             name: PROJECT_ROUTE_V2._NAME,
                             params: {
                                 projectGroupOrProjectId: item.key,
                             },
                         },
                         predicate,
                     }"
                     :icon="item.type === 'PROJECT_GROUP' ? projectGroupIcon : projectIcon"
                     display-type="tree"
                     :has-children="item.type === 'PROJECT_GROUP'"
                     :expanded="expandedMap[item.key]"
                     @update:expanded="expandedMap[item.key] = $event"
        >
            <template #action="{ id, hasChildren }">
                <favorite-button :item-id="id"
                                 :favorite-type="hasChildren ? FAVORITE_TYPE.PROJECT_GROUP : FAVORITE_TYPE.PROJECT"
                                 scale="0.8"
                                 class="favorite-button"
                />
            </template>
            <template #children="node">
                <project-l-s-b-tree :parent-group-id="node.id"
                                    :depth="node.depth + 1"
                                    :selected-paths="props.selectedPaths"
                />
            </template>
        </p-tree-node>
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

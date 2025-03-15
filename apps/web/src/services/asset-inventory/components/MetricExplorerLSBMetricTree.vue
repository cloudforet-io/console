<script setup lang="ts">
import {
    computed, reactive, watchEffect, ref, watch,
} from 'vue';

import { PTreeView, PI, PTextHighlighting } from '@cloudforet/mirinae';
import type { TreeDisplayMap, TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray } from '@/styles/colors';


const appContextStore = useAppContextStore();

interface Props {
    metricItems: TreeNode[];
    selectedId?: string;
    treeDisplayMap?: TreeDisplayMap;
    keyword?: string;
}

const props = defineProps<Props>();

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});

const filteredMetricItems = ref<TreeNode[]>([]);

watch(() => props.metricItems, (updatedMetricItems) => {
    filteredMetricItems.value = updatedMetricItems.filter(((metricItem) => {
        if (metricItem.data.is_managed) {
            return true;
        }
        if (storeState.isAdminMode) {
            return metricItem.data.data.resource_group === 'DOMAIN';
        }
        return metricItem.data.data.resource_group === 'WORKSPACE';
    }));
}, { immediate: true, deep: true });

watchEffect(() => {
    if (storeState.isAdminMode) {
        props.metricItems.forEach((metricItem: TreeNode) => {
            if (Object.keys(metricItem).includes(('children'))) {
                delete metricItem.children;
            }
        });
    }
});
</script>

<template>
    <p-tree-view :tree-data="filteredMetricItems"
                 :selected-id="props.selectedId"
                 :tree-display-map="props.treeDisplayMap"
                 use-default-indent
                 class="metric-explorer-l-s-b-metric-tree"
    >
        <template #content="{ node }">
            <div class="tree-menu-item-content">
                <div class="tree-item">
                    <p-i v-if="node.data.type === 'metric'"
                         class="tree-item-icon"
                         :name="node.data.is_managed ? 'ic_main-filled': 'ic_sub'"
                         width="0.875rem"
                         height="0.875rem"
                         :color="gray[500]"
                    />
                    <p-i v-else
                         class="tree-item-icon"
                         name="ic_example-filled"
                         width="0.875rem"
                         height="0.875rem"
                         :color="gray[700]"
                    />
                    <p-text-highlighting class="tree-item-name"
                                         :term="props.keyword"
                                         :text="node.data.name"
                    />
                </div>
                <favorite-button :item-id="node.id"
                                 :favorite-type="node.data.type === 'metric' ? FAVORITE_TYPE.METRIC : FAVORITE_TYPE.METRIC_EXAMPLE"
                                 scale="0.8"
                                 class="favorite-button"
                />
            </div>
        </template>
    </p-tree-view>
</template>

<style scoped lang="postcss">
.metric-explorer-l-s-b-metric-tree {
    .tree-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .tree-item {
            @apply flex items-center w-full;
            gap: 0.25rem;

            .tree-item-icon {
                min-width: 0.875rem;
            }
            .tree-item-name {
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
            .tree-item {
                width: calc(100% - 1.5rem);
            }
            .favorite-button {
                display: block;
            }
        }
    }
}

</style>

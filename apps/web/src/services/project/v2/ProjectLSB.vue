<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import type Vue from 'vue';
import {
    computed, nextTick, onMounted, ref, watch,
} from 'vue';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { TreeNodeRoutePredicate } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import { i18n } from '@/translations';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { type FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBStarredTree from '@/common/modules/navigations/new-lsb/LSBStarredTree.vue';
import LSBTitle from '@/common/modules/navigations/new-lsb/LSBTitle.vue';

import { indigo, peacock } from '@/styles/colors';

import ProjectLSBSearch from '@/services/project/v2/components/ProjectLSBSearch.vue';
import ProjectLSBTree from '@/services/project/v2/components/ProjectLSBTree.vue';
import { useProjectStarredTree } from '@/services/project/v2/composables/use-project-starred-tree';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    selectedPaths?: string[];
}>();

/* starred */
const favoriteStore = useFavoriteStore();
const { starredItems } = useProjectStarredTree({
    favoriteItems: computed(() => favoriteStore.getters.favoriteMenuList as FavoriteItem[]),
});

/* create button */
const projectPageModalStore = useProjectPageModalStore();
const createDropdownMenuItems = computed<SelectDropdownMenuItem[]>(() => ([
    {
        name: 'project',
        label: i18n.t('PROJECT.LANDING.PROJECT'),
        icon: 'ic_document-filled',
        iconColor: peacock[600],
    },
    {
        name: 'projectGroup',
        label: i18n.t('PROJECT.LANDING.PROJECT_GROUP'),
        icon: 'ic_folder-filled',
        iconColor: indigo[500],
    },
]));
const buttonRef = ref<any|null>(null);
const contextMenuRef = ref<any|null>(null);
const { visibleMenu, toggleContextMenu, hideContextMenu } = useContextMenuController({
    targetRef: buttonRef,
    contextMenuRef,
    position: 'right',
    menuWidth: 'max-content',
});
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    if (item.name === 'project') {
        projectPageModalStore.openProjectCreateModal();
    } else if (item.name === 'projectGroup') {
        projectPageModalStore.openProjectGroupCreateModal();
    }
    hideContextMenu();
};

/* all projects */
const predicate: TreeNodeRoutePredicate = (to, curr) => to.params?.projectGroupOrProjectId === curr.params.projectGroupOrProjectId;

/* search */
const projectKeyword = ref<string>('');

/* auto scroll */
const treeRef = ref<Vue | null>(null);

watch([() => props.selectedPaths, treeRef], ([paths, treeComponent]) => {
    if (!paths?.length || !treeComponent?.$el) return;

    nextTick(() => {
        const selectedNode = treeComponent.$el.querySelector(`[data-node-id="${paths[paths.length - 1]}"]`);
        if (selectedNode) {
            const rect = selectedNode.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0
                && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            );

            if (!isVisible) {
                selectedNode.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    });
});

/* init */
const mounted = ref(false);
onMounted(() => {
    nextTick(() => {
        mounted.value = true;
    });
});

</script>

<template>
    <l-s-b-container>
        <l-s-b-starred-tree expanded
                            :items="starredItems"
        />
        <l-s-b-divider />
        <l-s-b-title id="all-projects"
                     icon="ic_dots-4-square"
                     selectable
                     :link="{
                         to: {
                             name: PROJECT_ROUTE_V2._NAME,
                         },
                         predicate,
                     }"
        >
            <span class="font-normal">{{ $t('PROJECT.LANDING.ALL_PROJECTS') }}</span>
            <template #outer-right>
                <div v-on-click-outside="hideContextMenu"
                     class="relative"
                >
                    <p-button ref="buttonRef"
                              name="ic_plus"
                              size="sm"
                              style-type="tertiary"
                              class="cursor-pointer"
                              @click.stop.prevent="toggleContextMenu"
                    >
                        {{ $t('COMMON.BUTTONS.CREATE') }}
                    </p-button>
                    <p-context-menu v-show="visibleMenu"
                                    ref="contextMenuRef"
                                    class="z-10"
                                    no-select-indication
                                    :menu="createDropdownMenuItems"
                                    @select="handleSelectCreateMenu"
                    />
                </div>
            </template>
        </l-s-b-title>
        <l-s-b-divider />
        <l-s-b-title id="project-search"
                     :name="i18n.t('PROJECT.LANDING.PROJECT')"
        />
        <project-l-s-b-search :keyword="projectKeyword"
                              @update:keyword="projectKeyword = $event"
        />
        <project-l-s-b-tree v-if="mounted && !projectKeyword.length"
                            ref="treeRef"
                            :selected-paths="props.selectedPaths"
        />
    </l-s-b-container>
</template>


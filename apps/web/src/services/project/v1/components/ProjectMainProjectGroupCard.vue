<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PTextHighlighting, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo } from '@/styles/colors';

import type { ProjectCardItemType } from '@/services/project/v-shared/types/project-type';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';

interface Props {
    item: ProjectCardItemType;
    searchKeyword?: string;
}

const props = defineProps<Props>();
const router = useRouter();

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const projectPageStore = useProjectPageStore();

const storeState = reactive({
    favoriteItems: computed(() => favoriteGetters.projectGroupItems),
});

const state = reactive({
    isStarred: computed(() => storeState.favoriteItems.some((item) => item.itemId === props.item.id)),
    toolsetMenuItems: [
        {
            type: 'item',
            name: 'rename',
            label: i18n.t('Rename'),
            icon: 'ic_settings',
        },
        {
            type: 'item',
            name: 'move',
            label: i18n.t('Move'),
            icon: 'ic_move',
        },
        { type: 'divider', name: 'divider' },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('Delete'),
            icon: 'ic_delete',
        },
    ],
    toolsetMenuVisible: false,
});

const handleSelectProjectGroup = () => {
    router.push({
        name: PROJECT_ROUTE_V1._NAME,
        params: {
            projectGroupId: props.item.id as string,
        },
    }).catch(() => {});
};

const handleSelectItem = (selected: MenuItem) => {
    projectPageStore.setCurrentSelectedProjectGroupId(props.item.id);
    if (selected.name === 'rename') {
        projectPageStore.setProjectGroupFormUpdateMode(true);
        projectPageStore.setProjectGroupFormVisible(true);
    }
    if (selected.name === 'move') {
        projectPageStore.setProjectGroupMoveModalVisible(true);
    }
    if (selected.name === 'delete') {
        projectPageStore.setProjectDeleteModalVisible(true);
    }
};


</script>

<template>
    <div class="project-main-project-group-card"
         @click="handleSelectProjectGroup"
    >
        <div class="project-group-item">
            <p-i name="ic_folder-filled"
                 :color="indigo[500]"
                 width="1rem"
                 height="1rem"
            />
            <p-text-highlighting class="project-group-name"
                                 :text="props.item.name"
                                 :term="props.searchKeyword"
            />
        </div>
        <div class="toolset-group">
            <p-select-dropdown class="toolset-button"
                               style-type="tertiary-icon-button"
                               button-icon="ic_ellipsis-horizontal"
                               size="sm"
                               :visible-menu.sync="state.toolsetMenuVisible"
                               :menu="state.toolsetMenuItems"
                               :selected="[]"
                               use-fixed-menu-style
                               reset-selection-on-menu-close
                               @select="handleSelectItem"
            />
            <favorite-button :item-id="props.item.id"
                             :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                             :class="{'favorite-button': true, 'starred': state.isStarred }"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main-project-group-card {
    @apply flex items-center justify-between bg-gray-100 rounded-lg cursor-pointer;
    height: 3rem;
    padding: 0.75rem;

    .project-group-item {
        @apply flex gap-1;

        .project-group-name {
            @apply text-label-md text-gray-900;
        }
    }

    .favorite-button {
        display: none;

        &.starred {
            display: block;
        }
    }
    .toolset-button {
        display: none;
    }

    .toolset-group {
        @apply flex gap-1 items-center;
    }

    &:hover {
        @apply bg-gray-150;

        .toolset-button {
            display: block;
        }
        .favorite-button {
            display: block;
        }
    }
    &.toolset-active {
        @apply bg-blue-200;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .dropdown-button-component {
        @apply rounded-full;

        &.opened {
            @apply rounded-full;
        }
    }
}

</style>

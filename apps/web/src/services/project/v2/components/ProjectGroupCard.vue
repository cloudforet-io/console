<script setup lang="ts">

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PTextHighlighting } from '@cloudforet/mirinae';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo } from '@/styles/colors';

import ProjectActionDropdownButton from '@/services/project/v2/components/ProjectActionDropdownButton.vue';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';


const props = defineProps<{
    searchKeyword?: string;
    projectGroupId: string;
    name: string;
}>();


/* favorite */
const favoriteStore = useFavoriteStore();
const isStarred = computed(() => favoriteStore.getters.projectGroupItems.some((item) => item.itemId === props.projectGroupId));

/* project group select */
const router = useRouter();
const handleSelectProjectGroup = () => {
    router.replace({
        name: PROJECT_ROUTE_V2._NAME,
        params: {
            projectGroupOrProjectId: props.projectGroupId,
        },
    }).catch(() => {});
};

/* action menu */
const visibleActionMenu = ref(false);

</script>

<template>
    <div class="flex items-center justify-between bg-gray-100 rounded-lg cursor-pointer project-main-project-group-card"
         @click="handleSelectProjectGroup"
    >
        <div class="project-group-item">
            <p-i name="ic_folder-filled"
                 :color="indigo[500]"
                 width="1rem"
                 height="1rem"
            />
            <p-text-highlighting class="project-group-name"
                                 :text="props.name"
                                 :term="props.searchKeyword"
            />
        </div>
        <div class="toolset-group">
            <project-action-dropdown-button :project-group-id="props.projectGroupId"
                                            @update:visible="visibleActionMenu = $event"
            />
            <favorite-button :item-id="props.projectGroupId"
                             :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                             :class="{'favorite-button': true, 'starred': isStarred }"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main-project-group-card {
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
</style>

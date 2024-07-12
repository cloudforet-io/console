<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PTextHighlighting } from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo } from '@/styles/colors';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { ProjectCardItemType } from '@/services/project/types/project-type';

interface Props {
    item: ProjectCardItemType;
    searchKeyword?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const storeState = reactive({
    favoriteItems: computed(() => favoriteGetters.projectGroupItems),
});

const state = reactive({
    isStarred: computed(() => storeState.favoriteItems.some((item) => item.itemId === props.item.id)),
});

const handleSelectProjectGroup = () => {
    router.push(getProperRouteLocation({
        name: PROJECT_ROUTE._NAME,
        params: {
            projectGroupId: props.item.id as string,
        },
    }));
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
        <favorite-button :item-id="props.item.id"
                         :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                         scale="0.8"
                         :class="{'favorite-button': true, 'starred': state.isStarred }"
        />
    </div>
</template>

<style scoped lang="postcss">
.project-main-project-group-card {
    @apply flex items-center justify-between bg-white border border-gray-200 rounded-lg cursor-pointer;
    height: 2.625rem;
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

    &:hover {
        @apply bg-blue-100;

        .favorite-button {
            display: block;
        }
    }
}
</style>

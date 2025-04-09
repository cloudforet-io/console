<script setup lang="ts">

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PTextHighlighting, PTooltip, useTextEllipsis,
} from '@cloudforet/mirinae';


import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo } from '@/styles/colors';

import ProjectActionDropdownButton from '@/services/project/v2/components/ProjectActionDropdownButton.vue';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';


const props = defineProps<{
    searchKeyword?: string;
    projectGroupId: string;
    name: string;
}>();

/* projects and groups */
const projectListStore = useProjectListStore();
const projects = computed(() => projectListStore.getProjectsByGroupId(props.projectGroupId));
const projectGroups = computed(() => projectListStore.getProjectGroupsByParentId(props.projectGroupId));

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

/* text ellipsis */
const textEl = ref<HTMLElement|null>(null);
const { isEllipsis } = useTextEllipsis({ textEl });
</script>

<template>
    <div class="bg-gray-100 cursor-pointer p-3 hover:bg-gray-150 rounded-lg group/pg-card"
         :class="{ '!bg-blue-200': visibleActionMenu }"
         @click="handleSelectProjectGroup"
    >
        <div class="flex items-center justify-between rounded-t-lg h-6">
            <p-tooltip :contents="isEllipsis ? props.name : ''"
                       class="flex overflow-hidden"
                       position="bottom"
            >
                <div ref="textEl"
                     class="overflow-hidden whitespace-nowrap text-ellipsis"
                >
                    <p-i name="ic_folder-filled"
                         :color="indigo[500]"
                         class="mr-1"
                         width="1rem"
                         height="1rem"
                    />
                    <p-text-highlighting class="!text-label-md !font-medium"
                                         :text="props.name"
                                         :term="props.searchKeyword"
                    />
                </div>
            </p-tooltip>
            <div class="flex gap-1 items-center">
                <div class="hidden group-hover/pg-card:block"
                     :class="{'!block': visibleActionMenu }"
                >
                    <project-action-dropdown-button :project-group-id="props.projectGroupId"
                                                    usage-type="list"
                                                    @update:visible="visibleActionMenu = $event"
                    />
                </div>
                <div class="hidden group-hover/pg-card:block"
                     :class="{'!block': visibleActionMenu || isStarred }"
                >
                    <favorite-button :item-id="props.projectGroupId"
                                     :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                    />
                </div>
            </div>
        </div>
        <div class="mt-2 rounded-b-lg text-label-sm text-gray-600">
            {{ projectGroups.length }} {{ $t('PROJECT.LANDING.PROJECT_GROUPS') }} ⋅
            {{ projects.length }} {{ $t('PROJECT.LANDING.PROJECTS') }}
        </div>
    </div>
</template>

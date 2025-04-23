<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { i18n } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import ProjectLSB from '@/services/project/v2/ProjectLSB.vue';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';

/* project list store */
const projectListStore = useProjectListStore();
const projectMap = computed(() => projectListStore.projectMap);
const projectGroupMap = computed(() => projectListStore.projectGroupMap);

/* routed project or project group */
const route = useRoute();
const { projectGroupId, projectId } = useProjectOrGroupId(computed(() => route.params.projectGroupOrProjectId));

/* selected paths */
const parentIds = computed<string[]>(() => {
    const pids: string[] = [];
    let currentGroupId: string|undefined;
    if (projectId.value) currentGroupId = projectMap.value[projectId.value]?.data.groupInfo?.id;
    else currentGroupId = projectGroupId.value;
    while (currentGroupId) {
        pids.unshift(currentGroupId);
        currentGroupId = projectGroupMap.value[currentGroupId]?.data.parentGroupInfo?.id;
    }
    return pids;
});
const selectedPaths = computed<string[]>(() => {
    const paths = parentIds.value.slice();
    if (projectId.value) paths.push(projectId.value);
    return paths;
});

/* breadcrumbs */
const gnbStore = useGnbStore();
const projectGroupBreadcrumbs = computed<Breadcrumb[]>(() => {
    const breadcrumbs: Breadcrumb[] = [
        { name: i18n.t('MENU.PROJECT'), to: { name: PROJECT_ROUTE_V2._NAME } },
    ];
    breadcrumbs.push(...parentIds.value.map((id) => ({
        name: projectGroupMap.value[id]?.name ?? id,
        to: {
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: id,
            },
        },
    })));
    if (projectId.value) {
        breadcrumbs.push({
            name: projectMap.value[projectId.value]?.name ?? projectId.value,
            to: {
                name: PROJECT_ROUTE_V2._NAME,
                params: {
                    projectGroupOrProjectId: projectId.value,
                },
            },
        });
    }
    return breadcrumbs;
});
const favoriteOptions = computed<FavoriteOptions>(() => {
    if (projectId.value) {
        return {
            type: FAVORITE_TYPE.PROJECT,
            id: projectId.value,
        };
    }
    if (projectGroupId.value) {
        return {
            type: FAVORITE_TYPE.PROJECT_GROUP,
            id: projectGroupId.value,
        };
    }
    return {
        type: FAVORITE_TYPE.MENU,
        id: MENU_ID.PROJECT,
    };
});
watch(projectGroupBreadcrumbs, (bc) => {
    gnbStore.setBreadcrumbs(bc);
    gnbStore.setFavoriteItemId(favoriteOptions.value);
});
onUnmounted(() => {
    gnbStore.initState();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="route.meta?.lsbVisible">
            <template #sidebar>
                <project-l-s-b :selected-paths="selectedPaths" />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-else-if="route.meta?.centeredLayout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

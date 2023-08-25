<script lang="ts" setup>
import { PDataLoader, PEmpty } from '@spaceone/design-system';
import { sortBy } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { DisplayMenu } from '@/store/modules/display/type';
import type { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import type { SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const RECENT_LIMIT = 30;

interface Props {
    visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'close'): void}>();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const storeState = reactive({
    menuItems: computed<DisplayMenu[]>(() => store.getters['display/allMenuList']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
    recents: computed<RecentConfig[]>(() => store.state.recent.allItems),
});
const state = reactive({
    loading: true,
    items: computed<SuggestionItem[]>(() => sortBy(
        state.recentMenuItems
            .concat(state.recentCloudServiceItems)
            .concat(state.recentProjectItems)
            .concat(state.recentProjectGroupItems),
        (recent) => recent.updatedAt,
    ).reverse()),
    recentMenuItems: computed<RecentItem[]>(() => convertMenuConfigToReferenceData(
        storeState.recents.filter((d) => d.itemType === RECENT_TYPE.MENU),
        storeState.menuItems,
    )),
    recentCloudServiceItems: computed<RecentItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, store.getters['user/pagePermissionList']);
        return isUserAccessible ? convertCloudServiceConfigToReferenceData(
            storeState.recents.filter((d) => d.itemType === RECENT_TYPE.CLOUD_SERVICE),
            storeState.cloudServiceTypes,
        ) : [];
    }),
    recentProjectItems: computed<RecentItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
        return isUserAccessible ? convertProjectConfigToReferenceData(
            storeState.recents.filter((d) => d.itemType === RECENT_TYPE.PROJECT),
            storeState.projects,
        ) : [];
    }),
    recentProjectGroupItems: computed<RecentItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
        return isUserAccessible ? convertProjectGroupConfigToReferenceData(
            storeState.recents.filter((d) => d.itemType === RECENT_TYPE.PROJECT_GROUP),
            storeState.projectGroups,
        ) : [];
    }),
});

const handleSelect = (item: SuggestionItem) => {
    const itemName = item.name as string;
    if (item.itemType === SUGGESTION_TYPE.MENU) {
        const menuInfo: MenuInfo = MENU_INFO_MAP[itemName];
        if (menuInfo && router.currentRoute.value.name !== itemName) {
            router.push({ name: itemName }).catch(() => {});
        }
    } else if (item.itemType === SUGGESTION_TYPE.PROJECT) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.PROJECT_GROUP) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: itemInfo[2],
            },
        }).catch(() => {});
    }
    emit('close');
};
const handleClose = () => {
    emit('close');
};

/* Watcher */
watch(() => props.visible, async (visible) => {
    if (visible) {
        state.loading = true;
        await store.dispatch('recent/load', { limit: RECENT_LIMIT });
        state.loading = false;
    }
}, { immediate: true });

</script>

<template>
    <div class="gnb-recent">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :class="{ loading: state.loading && !state.items.length }"
        >
            <g-n-b-suggestion-list :items="state.items"
                                   use-favorite
                                   @close="handleClose"
                                   @select="handleSelect"
            />
            <template #no-data>
                <p-empty
                    show-image
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_spaceship_3.svg"
                        >
                    </template>
                    {{ t('COMMON.GNB.RECENT.RECENT_HELP_TEXT') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-recent {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 3rem 3.25rem;
}
</style>

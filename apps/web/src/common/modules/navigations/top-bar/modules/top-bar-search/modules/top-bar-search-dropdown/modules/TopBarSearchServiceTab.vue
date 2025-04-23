<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { debounce } from 'lodash';

import { getTextHighlightRegex, PDataLoader, PDivider } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';


import type { SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { useAllMenuList } from '@/lib/menu/use-all-menu-list';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import TopBarSearchEmpty
    from '@/common/modules/navigations/top-bar/modules/top-bar-search/modules/top-bar-search-dropdown/modules/TopBarSearchEmpty.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { FocusingDirection } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import TopBarSuggestionList from '@/common/modules/navigations/top-bar/modules/TopBarSuggestionList.vue';
import type { RecentItem } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

interface Props {
    searchLimit: number;
    isFocused: boolean;
    focusingDirection: string;
}

const props = withDefaults(defineProps<Props>(), {
    searchLimit: 15,
    isFocused: false,
    focusingDirection: 'DOWNWARD',
});

const userWorkspaceStore = useUserWorkspaceStore();
const topBarSearchStore = useTopBarSearchStore();
const recentStore = useRecentStore();
const authorizationStore = useAuthorizationStore();
const { getAllMenuList } = useAllMenuList();

const route = useRoute();
const router = useRouter();
const emit = defineEmits<{(event: 'move-focus-end'): void;
    (event: 'update:contents-size', value: number): void;
}>();

const contentRef = ref<null | HTMLElement>(null);
const contentSize = useElementSize(contentRef);
const MAIN_SERVICE_ID_LIST = ['dashboards', 'project', 'asset_inventory', 'cost_explorer', 'alert_manager'];

const storeState = reactive({
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    inputText: computed(() => topBarSearchStore.getters.inputText),
    trimmedInputText: computed(() => topBarSearchStore.getters.trimmedInputText),
});

const state = reactive({
    allMenuList: computed<SuggestionMenu[]>(() => {
        const allMenuList = getAllMenuList(route, router);
        return getAllSuggestionMenuList(allMenuList);
    }),
    allMenuMap: computed(() => {
        const allMenuMap = new Map<string, SuggestionMenu>();
        state.allMenuList.forEach((menu) => {
            allMenuMap.set(menu.id, {
                ...menu,
                icon: menu.parents?.[0]?.icon ?? menu.icon,
                fullLabel: menu.parents ? `${menu.parents.map((p) => p.label).join(' > ')} > ${menu.label}` : menu.label,
            });
        });
        return allMenuMap;
    }),
    serviceMenuList: [] as SuggestionMenu[],
    serviceMenuCount: computed(() => state.serviceMenuList.length),
    defaultServiceMenuList: computed(() => state.allMenuList.filter((menu) => MAIN_SERVICE_ID_LIST.includes(menu.id) && !menu.parents)),
    defaultServiceMenuItems: computed(() => {
        let results: SuggestionItem[] = [];
        if (state.defaultServiceMenuList.length) {
            results.push({ name: 'title', label: i18n.t('COMMON.NAVIGATIONS.TOP_BAR.SITE_NAVIGATION'), type: 'header' });
            results = results.concat(state.defaultServiceMenuList);
        }
        return results;
    }),
    recentMenuList: computed(() => {
        const _recentMenuList: RecentItem[] = [];
        recentStore.state.recentMenuList.forEach((i) => {
            if (authorizationStore.getters.pageAccessPermissionMap[i.data.id]) {
                _recentMenuList.push(i);
            }
        });
        return _recentMenuList.map((r: RecentItem) => {
            // NOTE: Code corresponding to data stored as 'home-dashboard'
            const id = r.data.id === 'home-dashboard' ? MENU_ID.WORKSPACE_HOME : r.data.id;
            return {
                id,
                label: state.allMenuMap.get(id)?.fullLabel ?? r.data.label,
                icon: state.allMenuMap.get(id)?.icon,
            };
        });
    }),
    recentMenuItems: computed(() => {
        let results: SuggestionItem[] = [];
        if (state.recentMenuList?.length) {
            results.push({ name: 'title', label: i18n.t('COMMON.NAVIGATIONS.TOP_BAR.RECENTLY_VIEWED'), type: 'header' });
            results = results.concat(state.recentMenuList);
        }
        return results;
    }),
    // focus
    proxyFocusingDirection: useProxyValue('focusingDirection', props, emit),
    focusingType: SUGGESTION_TYPE.DEFAULT_SERVICE as SuggestionType,
});

const filterMenuItemsBySearchTerm = (menu: SuggestionMenu[], searchTerm?: string): SuggestionMenu[] => {
    const regex = getTextHighlightRegex(searchTerm);
    const results = menu.map((d) => ({
        id: d.id,
        label: d.label,
        parents: d.parents ? d.parents : undefined,
        icon: d.parents?.[0]?.icon ?? d.icon,
    })).filter((d) => {
        if (regex.test(d.label as string)) return true;
        return d.parents && d.parents.some((p) => regex.test(p.label as string));
    });
    return results.slice(0, props.searchLimit);
};

const handleFocusEnd = (type: SuggestionType, direction: FocusingDirection) => {
    if (type === SUGGESTION_TYPE.DEFAULT_SERVICE) {
        if (direction === 'DOWNWARD' && state.recentMenuList.length) {
            state.proxyFocusingDirection = direction;
            state.focusingType = SUGGESTION_TYPE.RECENT;
        } else {
            emit('move-focus-end');
        }
    } else if (type === SUGGESTION_TYPE.RECENT) {
        if (direction === 'DOWNWARD') {
            state.focusingType = SUGGESTION_TYPE.DEFAULT_SERVICE;
            emit('move-focus-end');
        } else {
            state.proxyFocusingDirection = direction;
            state.focusingType = SUGGESTION_TYPE.DEFAULT_SERVICE;
        }
    }
};

const handleSelect = (item) => {
    const menuId = item.id;
    const menuInfo: MenuInfo = MENU_INFO_MAP[menuId];
    if (menuInfo && router.currentRoute.name !== menuId) {
        router.push({ name: menuInfo.routeName }).catch(() => {});
        recentStore.createRecent({
            type: RECENT_TYPE.SERVICE, workspaceId: storeState.currentWorkspaceId ?? '', id: menuId, label: item.label,
        });
    }
    topBarSearchStore.setIsActivated(false, {
        initSearch: false,
    });
};

onMounted(() => {
    if (storeState.trimmedInputText) {
        state.serviceMenuList = filterMenuItemsBySearchTerm(state.allMenuList, storeState.trimmedInputText);
    } else {
        state.serviceMenuList = [];
    }
});

watch(() => storeState.trimmedInputText, debounce(async (trimmedText) => {
    if (trimmedText) {
        state.serviceMenuList = filterMenuItemsBySearchTerm(state.allMenuList, trimmedText);
    } else {
        state.serviceMenuList = [];
    }
}, 300, {
    leading: true,
}));

watch(() => topBarSearchStore.getters.isActivated, async (isActivated) => {
    if (storeState.currentWorkspaceId && !isActivated) await recentStore.fetchRecent({ type: RECENT_TYPE.SERVICE, workspaceIds: [storeState.currentWorkspaceId] });
}, { immediate: true });

// /* Watcher */
watch(() => props.isFocused, (isFocused) => {
    if (isFocused) {
        if (props.focusingDirection === 'DOWNWARD') {
            state.focusingType = SUGGESTION_TYPE.DEFAULT_SERVICE;
        } else if (props.focusingDirection === 'UPWARD') {
            if (storeState.inputText.length) state.focusingType = SUGGESTION_TYPE.DEFAULT_SERVICE;
            else if (state.recentMenuList.length) state.focusingType = SUGGESTION_TYPE.RECENT;
            else state.focusingType = SUGGESTION_TYPE.DEFAULT_SERVICE;
        }
    }
});

watch(() => contentSize.height.value, (height) => {
    emit('update:contents-size', height);
});

</script>
<template>
    <div class="top-bar-search-service-tab">
        <div class="service-item-list">
            <div ref="contentRef">
                <div v-show="!storeState.inputText.length">
                    <top-bar-suggestion-list
                        :items="state.defaultServiceMenuItems || []"
                        :input-text="storeState.inputText"
                        :is-focused="state.focusingType === SUGGESTION_TYPE.DEFAULT_SERVICE ? props.isFocused : false"
                        :focusing-direction="props.focusingDirection"
                        @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.DEFAULT_SERVICE, ...arguments)"
                        @select="handleSelect"
                    />
                    <p-divider v-if="state.recentMenuList.length"
                               class="divider"
                    />
                    <top-bar-suggestion-list
                        v-if="state.recentMenuList.length"
                        :items="state.recentMenuItems || []"
                        :input-text="storeState.inputText"
                        :is-focused="state.focusingType === SUGGESTION_TYPE.RECENT ? props.isFocused : false"
                        :focusing-direction="props.focusingDirection"
                        @move-focus-end="handleFocusEnd(SUGGESTION_TYPE.RECENT, ...arguments)"
                        @select="handleSelect"
                    />
                </div>
                <p-data-loader :data="state.serviceMenuList ||[]"
                               :loading="false"
                >
                    <top-bar-suggestion-list v-show="state.serviceMenuList && state.serviceMenuList.length > 0"
                                             :items="state.serviceMenuList || []"
                                             :input-text="storeState.inputText"
                                             :is-focused="state.focusingType === SUGGESTION_TYPE.DEFAULT_SERVICE ? props.isFocused : false"
                                             :focusing-direction="props.focusingDirection"
                                             @move-focus-end="() => emit('move-focus-end')"
                                             @select="handleSelect"
                    />
                    <template #no-data>
                        <top-bar-search-empty :input-text="storeState.inputText"
                                              :is-recent="false"
                        />
                    </template>
                </p-data-loader>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.top-bar-search-service-tab {
    padding: 1rem 0;
    height: 100%;
    .service-item-list {
        height: 100%;
        overflow-y: auto;
        .divider {
            margin: 0 1.25rem 0.75rem 1.25rem;
            width: unset;
        }
    }
}
</style>

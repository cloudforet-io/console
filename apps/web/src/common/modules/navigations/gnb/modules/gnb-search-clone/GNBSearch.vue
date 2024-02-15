<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    getTextHighlightRegex, PI, screens, PTooltip,
} from '@spaceone/design-system';
import { debounce, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { RecentConfig } from '@/store/modules/recent/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import type { SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';
import {
    SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search-clone/config';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/config';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/GNBSearchDropdown.vue';
import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/GNBSearchInput.vue';
import { useGnbSearchStore } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/store';
import type { DropdownItem, FocusingDirection } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

interface CloudServiceData {
    id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}
interface AutocompleteResourceResult {
    key: string;
    name?: string;
    data?: CloudServiceData;
}

const MOBILE_WINDOW_SIZE = screens.mobile.max;

const RECENT_LIMIT = 5;
const SEARCH_LIMIT = 15;

const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
}>();

const gnbSearchStore = useGnbSearchStore();

const router = useRouter();
const state = reactive({
    isFocusOnInput: false,
    isFocusOnSuggestion: false,
    focusingDirection: 'DOWNWARD',
    inputText: '',
    trimmedInputText: computed<string>(() => {
        if (state.inputText) return state.inputText.trim();
        return '';
    }),
    isOverMobileSize: window.innerWidth > MOBILE_WINDOW_SIZE,
    loading: true,
    showRecent: computed(() => !state.inputText.length),
    tooltipTexts: computed<Record<string, string>>(() => ({
        search: i18n.t('COMMON.GNB.TOOLTIP.SEARCH') as string,
    })),
    visible: computed(() => gnbSearchStore.getters.isActivated),
});

const dataState = reactive({
    // menu
    recentMenuList: null as RecentConfig[]|null,
    allMenuList: computed<SuggestionMenu[]>(() => getAllSuggestionMenuList(store.getters['display/allMenuList'])),
    filteredMenuList: [] as SuggestionMenu[],
    _menuTotalCount: 0,
    _menuSuggestions: computed<SuggestionItem[]|null>(() => {
        if (!dataState.recentMenuList) return null;
        if (state.showRecent) {
            return convertMenuConfigToReferenceData(dataState.recentMenuList, store.getters['display/allMenuList']);
        }
        return dataState.filteredMenuList.map((d) => ({
            itemType: SUGGESTION_TYPE.MENU,
            name: d.id,
            label: d.label,
            parents: d.parents ? d.parents.map((p) => ({ name: p.id, label: p.label })) : undefined,
            icon: d.icon,
        }));
    }),
    // cloud service
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
    filteredCloudServices: [] as CloudServiceData[],
    recentCloudServices: [] as RecentConfig[],
    _cloudServiceTotalCount: 0,
    _cloudServiceSuggestions: computed<SuggestionItem[]>(() => {
        if (state.showRecent) {
            return convertCloudServiceConfigToReferenceData(dataState.recentCloudServices, dataState.cloudServiceTypes);
        }
        return dataState.filteredCloudServices.map((d) => ({
            itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
            name: d.id,
            label: d.name,
            icon: d.icon,
            defaultIcon: d.icon,
            parents: [{ name: d.group, label: d.group }],
            provider: d.provider,
        }));
    }),
    // all
    dropdownItems: computed<DropdownItem[]>(() => {
        const items: DropdownItem[] = [
            {
                itemType: SUGGESTION_TYPE.MENU,
                totalCount: dataState._menuTotalCount,
                suggestionItems: dataState._menuSuggestions,
            },
        ];

        if (isUserAccessibleToMenu(MENU_ID.CLOUD_SERVICE, store.getters['user/pageAccessPermissionList'])) {
            items.push({
                itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                totalCount: dataState._cloudServiceTotalCount,
                suggestionItems: dataState._cloudServiceSuggestions,
            });
        }
        return items;
    }),
});

const setVisible = (visible: boolean) => {
    emit('update:visible', visible);
};

const filterMenuItemsBySearchTerm = (menu: SuggestionMenu[], searchTerm?: string): SuggestionMenu[] => {
    const regex = getTextHighlightRegex(searchTerm);
    const results = menu.map((d) => ({
        id: d.id,
        label: d.label,
        parents: d.parents ? d.parents : undefined,
        icon: d.parents?.[0]?.icon ?? d.icon,
    })).filter((d) => {
        if (regex.test(d.label as string)) return true;
        if (d.parents && d.parents.some((p) => regex.test(p.label as string))) return true;
        return false;
    });

    dataState._menuTotalCount = results.length;
    return results.slice(0, SEARCH_LIMIT);
};

/* API */
const fetcher = getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.resource);
const getCloudServiceResources = async (inputText): Promise<AutocompleteResourceResult[]|undefined> => {
    try {
        state.loading = true;
        const { status, response } = await fetcher({
            resource_type: 'inventory.CloudServiceType',
            search: inputText,
            options: {
                limit: 15,
                targets: ['name', 'group'],
            },
        });
        if (status === 'succeed') {
            dataState._cloudServiceTotalCount = response.total_count;
            return response.results;
        }
        return undefined;
    } catch (e) {
        ErrorHandler.handleError(e);
        dataState._cloudServiceTotalCount = 0;
        return [];
    } finally {
        state.loading = false;
    }
};
const listSearchRecent = async (type: SuggestionType) => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.addOns.recent.search.list({
            type,
            limit: RECENT_LIMIT,
        });
        const recentConfig: RecentConfig[] = results.map((d) => ({
            itemType: d.data.type,
            itemId: d.data.id,
            updatedAt: d.updated_at,
        }));
        if (type === SUGGESTION_TYPE.MENU) dataState.recentMenuList = recentConfig;
        else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) dataState.recentCloudServices = recentConfig;
    } catch (e) {
        ErrorHandler.handleError(e);
        if (type === SUGGESTION_TYPE.MENU) dataState.recentMenuList = [];
        else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) dataState.recentCloudServices = [];
    } finally {
        state.loading = false;
    }
};
const createSearchRecent = async (type: SuggestionType, id: string) => {
    try {
        await SpaceConnector.client.addOns.recent.search.create({
            type,
            id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Event */
const showSearchMenu = async () => {
    state.isFocusOnSuggestion = false;
    if (!state.isFocusOnInput) state.isFocusOnInput = true;
    if (!state.visible) {
        state.loading = true;
        state.loading = false;
        setVisible(true); // Note: When the GNB is refactored, this emit would be removed.
        gnbSearchStore.setIsActivated(true);
    }
};

const hideSearchMenu = () => {
    if (state.visible) {
        setVisible(false); // Note: When the GNB is refactored, this emit would be removed.
        gnbSearchStore.setIsActivated(false);
        state.inputText = '';
        state.isFocusOnInput = false;
        state.isFocusOnSuggestion = false;
        dataState.filteredCloudServices = [];
        dataState.filteredMenuList = [];
    }
};

const moveFocusToSuggestion = (focusingDirection: FocusingDirection) => {
    if (!state.visible) {
        setVisible(true); // Note: When the GNB is refactored, this emit would be removed.
        gnbSearchStore.setIsActivated(true);
    }
    state.focusingDirection = focusingDirection;
    state.isFocusOnInput = false;
    state.isFocusOnSuggestion = true;
};

const handleSearchButtonClick = () => {
    if (!state.visible) showSearchMenu();
    else hideSearchMenu();
};

const handleMoveFocusEnd = () => {
    state.focusingDirection = undefined;
    state.isFocusOnSuggestion = false;
    state.isFocusOnInput = true;
};

const handleUpdateInput = debounce(async (e) => {
    if (!e.length) return;
    state.loading = true;
    if (state.trimmedInputText) {
        const results = await getCloudServiceResources(state.trimmedInputText);
        if (results) {
            dataState.filteredCloudServices = results.map((d) => d.data);
            dataState.filteredMenuList = filterMenuItemsBySearchTerm(dataState.allMenuList, state.trimmedInputText);
        }
    }
}, 300, {
    leading: true,
});

const handleSelect = (index: number, type: SuggestionType) => {
    if (type === 'MENU') {
        const menuId = state.showRecent ? dataState.recentMenuList[index]?.itemId : dataState.filteredMenuList[index]?.id;
        if (!menuId) return;

        const menuInfo: MenuInfo = MENU_INFO_MAP[menuId];
        if (menuInfo && router.currentRoute.name !== menuId) {
            router.push({ name: menuInfo.routeName }).catch(() => {});
            if (!state.showRecent) createSearchRecent(type, menuId);
        }
    } else {
        let cloudServiceTypekey;
        if (state.showRecent) cloudServiceTypekey = dataState.recentCloudServices[index]?.itemId;
        else {
            const cloudServiceId = dataState.filteredCloudServices[index]?.id;
            if (!cloudServiceId) return;
            const cloudService = dataState.cloudServiceTypes[cloudServiceId];
            cloudServiceTypekey = cloudService.data.cloudServiceTypeKey;
        }
        if (cloudServiceTypekey) {
            const itemInfo: string[] = cloudServiceTypekey.split('.');
            router.push({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: itemInfo[0],
                    group: itemInfo[1],
                    name: itemInfo[2],
                },
            }).catch(() => {
            });
            if (!state.showRecent) createSearchRecent(type, cloudServiceTypekey);
        }
    }
    hideSearchMenu();
};

const onWindowResize = throttle(() => {
    state.isOverMobileSize = window.innerWidth > MOBILE_WINDOW_SIZE;
}, 500);

// Keyboard Event: Meta([ctrl or cmd] + K
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.code === 'KeyK') {
        gnbSearchStore.setIsActivated(!state.visible);
        state.isFocusOnInput = state.visible;
    } else if (e.code === 'Escape') {
        gnbSearchStore.setIsActivated(false);
    }
};

onMounted(() => {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('keydown', handleKeyDown);
});

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/cloudServiceType/load'),
    ]);
})();

/* Watcher */
watch(() => state.visible, async (visible) => {
    if (visible) {
        await Promise.allSettled([
            listSearchRecent(SUGGESTION_TYPE.MENU),
            listSearchRecent(SUGGESTION_TYPE.CLOUD_SERVICE),
        ]);
    }
});

</script>

<template>
    <div class="gnb-search"
         @click.stop
    >
        <g-n-b-search-input v-if="state.isOverMobileSize"
                            v-model="state.inputText"
                            :is-focused.sync="state.isFocusOnInput"
                            @click="showSearchMenu"
                            @esc="hideSearchMenu"
                            @arrow-up="moveFocusToSuggestion('UPWARD')"
                            @arrow-down="moveFocusToSuggestion('DOWNWARD')"
                            @input="handleUpdateInput"
        />

        <p-tooltip v-else
                   :contents="state.tooltipTexts.search"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': state.visible}"
                  tabindex="0"
                  role="button"
                  @click.stop="handleSearchButtonClick"
                  @keydown.esc="hideSearchMenu"
                  @keydown.enter="showSearchMenu"
            >
                <p-i name="ic_gnb_search"
                     height="1.375rem"
                     width="1.375rem"
                     color="inherit"
                />
            </span>
        </p-tooltip>

        <g-n-b-search-dropdown v-show="state.visible"
                               :input-text="state.trimmedInputText"
                               :loading="state.loading"
                               :items="dataState.dropdownItems"
                               :focusing-direction.sync="state.focusingDirection"
                               :is-focused.sync="state.isFocusOnSuggestion"
                               :is-recent="state.showRecent"
                               :search-limit="SEARCH_LIMIT"
                               @move-focus-end="handleMoveFocusEnd"
                               @close="hideSearchMenu"
                               @select="handleSelect"
        >
            <template #search-input>
                <g-n-b-search-input v-if="!state.isOverMobileSize"
                                    v-model="state.inputText"
                                    :is-focused.sync="state.isFocusOnInput"
                                    @click="showSearchMenu"
                                    @esc="hideSearchMenu"
                                    @arrow-up="moveFocusToSuggestion('UPWARD')"
                                    @arrow-down="moveFocusToSuggestion('DOWNWARD')"
                                    @input="handleUpdateInput"
                />
            </template>
        </g-n-b-search-dropdown>
        <div v-if="state.visible"
             class="background-block"
             @click="hideSearchMenu"
        />
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search {
    @apply relative;
    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        &:hover {
            @apply text-blue-600 bg-blue-100;
        }

        &.opened {
            @apply text-blue-600 bg-blue-200;
        }
    }
    .background-block {
        @apply fixed inset-0 bg-black;
        opacity: 30%;
        z-index: 100;
    }
}
</style>

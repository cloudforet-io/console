<script setup lang="ts">

import { computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI, PSearch } from '@spaceone/design-system';


import { i18n } from '@/translations';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBMenu, LSBCollapsibleItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { yellow } from '@/styles/colors';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricNamespace } from '@/services/asset-inventory/types/metric-explorer-type';

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();

const state = reactive({
    currentPath: computed(() => route.fullPath),
    menuSet: computed(() => {
        const baseMenuSet = [
            {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: i18n.t('COMMON.STARRED'),
                id: 'starred',
            },
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
            {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: i18n.t('COMMON.NAMESPACE'),
                id: 'namespace',
            },
        ];
        return baseMenuSet;
    }),
    starredMenuSet: computed<LSBMenu[]>(() => []),
});

const namespaceState = reactive({
    inputValue: '',
    namespaces: computed(() => metricExplorerPageStore.state.namespaces),
    namespaceItems: computed<LSBCollapsibleItem[]>(() => [
        ...convertNamespaceToLSBCollapsibleItems(namespaceState.namespaces),
    ]),
    selectedNamespace: '',
});

// const metricState = reactive({
//
// });

/* Helper */
const convertNamespaceToLSBCollapsibleItems = (namespaces: MetricNamespace[]): LSBCollapsibleItem[] => {
    const namespaceMap = {};
    namespaces.forEach((namespace) => {
        if (namespaceMap[namespace.provider]) {
            namespaceMap[namespace.provider].subItems.push({
                label: `${namespace.provider}/${namespace.cloud_service_group}`,
                name: namespace.cloud_service_group,
            });
        } else {
            namespaceMap[namespace.provider] = {
                type: MENU_ITEM_TYPE.COLLAPSIBLE,
                label: namespace.provider,
                subItems: [{
                    label: `${namespace.provider}/${namespace.cloud_service_group}`,
                    name: namespace.cloud_service_group,
                }],
            };
        }
    });
    return Object.values(namespaceMap);
};

/* Event */
const handleSearch = (keyword: string) => {
    namespaceState.inputValue = keyword;
};
const handleClickNamespace = (namespace: string) => {
    namespaceState.selectedNamespace = namespace;
};

onMounted(async () => {
    await metricExplorerPageStore.loadNamespaces();
});

</script>

<template>
    <l-s-b class="metric-explorer-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #collapsible-contents-starred>
            <div v-if="state.starredMenuSet.length > 0">
                <l-s-b-router-menu-item v-for="(item, idx) of state.starredMenuSet"
                                        :key="idx"
                                        :item="item"
                                        :idx="idx"
                                        :current-path="state.currentPath"
                                        is-hide-favorite
                />
            </div>
            <span v-else
                  class="no-data"
            >
                <p-i class="menu-icon"
                     name="ic_star-filled"
                     height="1rem"
                     width="1rem"
                     :color="yellow[500]"
                />
                {{ $t('COMMON.STARRED_NO_DATA') }}
            </span>
        </template>
        <template #collapsible-contents-namespace>
            <div class="namespace-wrapper">
                <p-search class="metric-search"
                          :value="namespaceState.inputValue"
                          @update:value="handleSearch"
                />
                <l-s-b-collapsible-menu-item v-for="(item, idx) in namespaceState.namespaceItems"
                                             :key="`provider-${idx}`"
                                             class="provider-menu-item"
                                             :item="item"
                                             is-sub-item
                >
                    <template #collapsible-contents="{ item: _item }">
                        <div v-for="(_menu, _idx) in _item.subItems"
                             :key="`${_menu.label}-${_idx}`"
                             class="namespace-menu-item"
                             @click="handleClickNamespace(_menu.name)"
                        >
                            <span class="text">
                                {{ _menu.label }}
                            </span>
                        </div>
                    </template>
                </l-s-b-collapsible-menu-item>
            </div>
        </template>
    </l-s-b>
</template>

<style scoped lang="postcss">
.metric-explorer-l-s-b {
    .namespace-wrapper {
        @apply flex flex-col gap-1;
        padding: 0 0.5rem;

        .namespace-menu-item {
            @apply inline-flex items-center w-full text-gray-800;
            height: 2rem;
            padding: 0 0.5rem;
            border-radius: 0.25rem;

            &:hover {
                @apply bg-blue-100 cursor-pointer;
            }
            .text {
                @apply text-label-md overflow-hidden whitespace-no-wrap;
                text-overflow: ellipsis;
            }
        }
    }
    .no-data {
        @apply flex text-gray-500;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.125rem;
    }
}
</style>

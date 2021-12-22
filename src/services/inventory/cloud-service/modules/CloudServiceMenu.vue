<template>
    <aside class="cloud-service-menu">
        <!-- Favorites -->
        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES')">
            <template #extra>
                <span class="count">({{ favoriteItems.length }})</span>
            </template>
        </sidebar-title>
        <favorite-list :items="favoriteItems" class="favorite-list" @delete="handleFavoriteDelete">
            <template #icon="{item}">
                <p-lazy-img :src="item.icon || ''" error-icon="ic_provider_other"
                            width="1rem" height="1rem"
                />
            </template>
        </favorite-list>
        <!-- Providers -->
        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_PROVIDER')" />
        <p-radio class="provider-wrapper"
                 value="all"
                 :selected="selectedProvider"
                 @click="handleChangeProvider('all')"
        >
            <template #radio-left>
                <p-lazy-img error-icon="ic_provider_other" width="1.5rem" height="1.5rem" />
                <span class="provider-name">All</span>
            </template>
        </p-radio>
        <p-radio v-for="[provider, providerItem] in Object.entries(providers)"
                 :key="`radio-${provider}`"
                 :value="provider"
                 :selected="selectedProvider"
                 class="provider-wrapper"
                 @click="handleChangeProvider(provider)"
        >
            <template #radio-left>
                <p-lazy-img :src="providerItem.icon || ''" error-icon="ic_provider_other"
                            width="1.5rem" height="1.5rem"
                />
                <span class="provider-name">{{ providerItem.name }}</span>
            </template>
        </p-radio>
        <!-- Categories -->
        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY')" />
        <div v-for="(category, idx) in categoryItems" :key="`category-${category.name}-${idx}`"
             class="category-wrapper"
        >
            <p-check-box :value="category.name"
                         :selected="selectedCategories"
                         @change="handleChangeCategory(category.name)"
            >
                <span class="text">{{ category.label }}</span>
            </p-check-box>
        </div>
        <!-- Regions -->
        <sidebar-title :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.REGION')" />
        <p-empty v-if="!regionItems.length" class="no-region-wrapper">
            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.NO_REGION') }}
        </p-empty>
        <div v-for="(region, idx) in regionItems" :key="`region-${region.name}-${idx}`"
             class="region-wrapper"
        >
            <p-check-box :value="region.name"
                         class="flex"
                         :selected="selectedRegions"
                         @change="handleChangeRegion(region.name)"
            >
                <div class="region-list-text">
                    <div class="region-type">
                        <span class="region-provider"
                              :style="{color: providers[region.provider] ? providers[region.provider].color : undefined}"
                        >
                            {{ providers[region.provider] ? providers[region.provider].label : region.provider }}
                        </span>
                        {{ region.label }}
                    </div>
                    <span class="region-code">{{ region.name }} </span>
                </div>
            </p-check-box>
        </div>
    </aside>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PLazyImg, PRadio, PCheckBox, PEmpty,
} from '@spaceone/design-system';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { CATEGORY } from '@/services/inventory/cloud-service/lib/config';
import { FavoriteItem } from '@/store/modules/favorite/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';


interface RegionItem {
    name: string;
    label: string;
    provider: string;
}

export default {
    name: 'CloudServiceMenu',
    components: {
        SidebarTitle,
        FavoriteList,
        PLazyImg,
        PRadio,
        PCheckBox,
        PEmpty,
    },
    setup() {
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            favoriteItems: computed(() => store.getters['favorite/cloudServiceType/sortedItems']),
            regionItems: [] as RegionItem[],
            categoryItems: [
                { name: CATEGORY.COMPUTE, label: 'Compute' },
                { name: CATEGORY.CONTAINER, label: 'Container' },
                { name: CATEGORY.DATABASE, label: 'Database' },
                { name: CATEGORY.NETWORKING, label: 'Networking' },
                { name: CATEGORY.STORAGE, label: 'Storage' },
                { name: CATEGORY.SECURITY, label: 'Security' },
                { name: CATEGORY.ANALYTICS, label: 'Analytics' },
                { name: CATEGORY.APPLICATION_INTEGRATION, label: 'Application Integration' },
                { name: CATEGORY.MANAGEMENT, label: 'Management' },
            ],
            //
            selectedProvider: computed(() => store.state.service.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.cloudService.selectedRegions),
        });

        /* api */
        const regionApiQueryHelper = new ApiQueryHelper().setOnly('region_code', 'provider', 'name').setSort('provider');
        const listRegionByProvider = async (provider) => {
            try {
                if (!provider || provider === 'all') {
                    regionApiQueryHelper.setFilters([]);
                } else {
                    regionApiQueryHelper.setFilters([{
                        k: 'provider',
                        v: provider,
                        o: '=',
                    }]);
                }
                const { results } = await SpaceConnector.client.inventory.region.list({
                    query: regionApiQueryHelper.data,
                });
                state.regionItems = results.map(d => ({
                    name: d.region_code,
                    label: d.name,
                    provider: d.provider,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* event */
        const handleFavoriteDelete = (item: FavoriteItem) => {
            store.dispatch('favorite/cloudServiceType/removeItem', item);
        };
        const handleChangeProvider = (provider: string) => {
            store.commit('service/cloudService/setSelectedProvider', provider);
        };
        const handleChangeCategory = (category: CATEGORY) => {
            const _index = state.selectedCategories.findIndex(d => d === category);
            const _selectedCategories = [...state.selectedCategories];

            if (_index < 0) _selectedCategories.push(category);
            else _selectedCategories.splice(_index, 1);
            store.commit('service/cloudService/setSelectedCategories', _selectedCategories);
        };
        const handleChangeRegion = (region: string) => {
            const _index = state.selectedRegions.findIndex(d => d === region);
            const _selectedRegions = [...state.selectedRegions];

            if (_index < 0) _selectedRegions.push(region);
            else _selectedRegions.splice(_index, 1);
            store.commit('service/cloudService/setSelectedRegions', _selectedRegions);
        };

        /* Watcher */
        watch(() => state.selectedProvider, ((selectedProvider) => {
            listRegionByProvider(selectedProvider);
        }), { immediate: true });

        return {
            ...toRefs(state),
            handleFavoriteDelete,
            handleChangeProvider,
            handleChangeCategory,
            handleChangeRegion,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cloud-service-menu {
    padding-bottom: 2.75rem;
    .favorite-list {
        @apply px-4;
    }
    .provider-wrapper::v-deep {
        display: flex;
        min-height: 1.75rem;
        align-items: center;
        cursor: pointer;
        margin: 0.25rem 0.75rem;
        .p-lazy-img {
            flex-shrink: 0;
        }
        .radio-icon {
            flex-shrink: 0;
        }
        .provider-name {
            display: inline-block;
            margin-left: 0.5rem;
            flex-grow: 1;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        &:hover {
            @apply bg-secondary2;
            .provider-name {
                @apply text-secondary;
            }
        }
    }
    .category-wrapper {
        @apply text-sm;
        margin-left: 0.75rem;
        padding-bottom: 0.5rem;
        .text {
            padding-left: 0.25rem;
            &:hover {
                @apply text-secondary cursor-pointer;
            }
        }
    }
    .no-region-wrapper {
        display: block;
        font-size: 0.875rem;
        padding-left: 1rem;
    }

    .region-wrapper {
        display: flex;
        padding-left: 0.75rem;
        padding-right: 1.625rem;
        margin-bottom: 0.75rem;
        width: 100%;

        .p-checkbox::v-deep {
            .check-icon {
                flex-shrink: 0;
            }
        }
        &:last-of-type {
            padding-bottom: 2.75rem;
        }
    }
    .region-list-text {
        @apply text-sm;
        display: flex;
        flex-direction: column;
        .region-type {
            padding-left: 0.25rem;
        }
        .region-provider {
            @apply mr-1;
        }
        .region-code {
            @apply text-gray-400;
            padding-left: 0.25rem;
        }
        &:hover {
            @apply text-secondary cursor-pointer;
            .region-provider,
            .region-code {
                @apply text-secondary !important;
            }
        }
    }
}
</style>

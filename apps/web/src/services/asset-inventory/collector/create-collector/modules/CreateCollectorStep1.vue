<template>
    <div class="collector-page-1">
        <p-search v-model="state.searchValue"
                  @search="handleSearch"
        />
        <div class="contents-container">
            <step1-search-filter @selectedRepository="handleChangeRepository" />
            <p-data-loader class="right-area"
                           :data="state.pluginList"
                           :loading="state.loading"
                           :loader-backdrop-color="BACKGROUND_COLOR"
            >
                <div ref="pluginCardListRef"
                     class="plugin-card-list"
                >
                    <p-board-item v-for="item in state.pluginList"
                                  :key="item.name"
                                  class="plugin-card-item"
                    >
                        <template #content>
                            <div class="plugin-card-content">
                                <collect-plugin-contents :plugin="item" />
                                <p-button style-type="secondary"
                                          class="select-button"
                                          @click="handleClickNextStep(item)"
                                >
                                    {{ $t('INVENTORY.COLLECTOR.CREATE.SELECT') }}
                                </p-button>
                                <p-i class="select-icon"
                                     name="ic_chevron-right"
                                     :color="gray[300]"
                                     width="1.5rem"
                                     height="1.5rem"
                                     @click="handleClickNextStep(item)"
                                />
                            </div>
                        </template>
                    </p-board-item>
                </div>
            </p-data-loader>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useInfiniteScroll } from '@vueuse/core';
import {
    onMounted, reactive, ref, watch,
} from 'vue';

import {
    PSearch, PDataLoader, PBoardItem, PButton, PI,
} from '@spaceone/design-system';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';
import { BACKGROUND_COLOR } from '@/styles/colorsets';

import Step1SearchFilter from '@/services/asset-inventory/collector/create-collector/modules/Step1SearchFilter.vue';
import CollectPluginContents
    from '@/services/asset-inventory/collector/modules/CollectorPluginContents.vue';
import type { CollectorPluginModel } from '@/services/asset-inventory/collector/type';
import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;


const state = reactive({
    searchValue: '',
    pluginList: [] as CollectorPluginModel[],
    loading: false,
    selectedRepository: '',
    currentPage: 1,
    totalCount: 0,
});
const pluginCardListRef = ref<HTMLElement | null>(null);


const pluginApiQuery = new ApiQueryHelper();
const getPlugins = async (): Promise<CollectorPluginModel[]> => {
    state.loading = true;
    try {
        pluginApiQuery.setPage(getPageStart(state.currentPage, 10), 10).setSort('name', false)
            .setFilters([{ v: state.searchValue }]);

        const params = {
            service_type: 'inventory.Collector',
            repository_id: state.selectedRepository === 'all' ? '' : state.selectedRepository,
            provider: collectorPageState.selectedProvider === 'all' ? '' : collectorPageState.selectedProvider,
            query: pluginApiQuery.data,
        };
        const res = await SpaceConnector.client.repository.plugin.list(params);
        state.totalCount = res.total_count;
        return [
            ...res.results.map((d) => ({
                icon: assetUrlConverter(d.tags?.icon),
                ...d,
            })),
        ];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    } finally {
        state.loading = false;
    }
};

const loadMorePlugin = async () => {
    if (state.totalCount <= state.pluginList.length) {
        return;
    }
    state.currentPage += 1;
    state.loading = true;
    const additionalPlugin = await getPlugins();
    state.pluginList = [...state.pluginList, ...additionalPlugin];
};

const handleSearch = async (value) => {
    state.searchValue = value;
    state.pluginList = await getPlugins();
};
const handleClickNextStep = (item: CollectorPluginModel) => {
    emit('update:currentStep', 2);
    collectorFormStore.setPluginInfo(item);
};
const handleChangeRepository = (value:string) => {
    state.selectedRepository = value;
};

watch([() => collectorPageState.selectedProvider, () => state.selectedRepository], async () => {
    state.currentPage = 1;
    state.pluginList = await getPlugins();
}, { immediate: true });

onMounted(() => {
    useInfiniteScroll(pluginCardListRef, () => {
        loadMorePlugin();
    });
});
</script>

<style lang="postcss" scoped>
.collector-page-1 {
    min-width: 59.5625rem;
    max-height: 100vh;
    width: 100%;
    .contents-container {
        @apply flex;
        margin-top: 1.5rem;

        .right-area {
            max-width: 44.375rem;
            .plugin-card-list {
                @apply flex flex-col gap-2;
                overflow-y: auto;
                height: calc(100vh - 18rem);
                :deep(.p-board-item) {
                    .content-area .content {
                        flex-grow: unset;
                        width: 100%;
                    }
                }

                .plugin-card-item {
                    border-radius: 0.375rem;
                    width: 100%;
                    min-height: unset;

                    .plugin-card-content {
                        @apply flex justify-between;
                        width: 100%;
                        .select-button {
                            flex-shrink: 0;
                        }
                        .select-icon {
                            display: none;
                        }
                    }
                }
            }
            .beta {
                @apply text-coral;
                font-size: 0.5rem;
                font-weight: bold;
                vertical-align: super;
                margin-left: 0.2rem;
            }
        }
    }
}

@screen tablet {
    .collector-page-1 {
        min-width: 43rem;
        .contents-container {
            @apply flex-col;
            .right-area {
                .plugin-card-list {
                    .plugin-card-item {
                        .plugin-card-content {
                            @apply flex items-center;
                            .select-button {
                                display: none;
                            }
                            .select-icon {
                                flex-shrink: 0;
                                display: inline-block;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }
}

@screen mobile {
    .collector-page-1 {
        min-width: unset;
        max-width: 100vw;
    }
}
</style>


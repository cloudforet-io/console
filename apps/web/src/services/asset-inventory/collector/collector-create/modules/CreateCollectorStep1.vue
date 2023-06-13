<template>
    <div class="collector-page-1">
        <p-search v-model="state.searchValue"
                  @search="handleSearch"
        />
        <div class="contents-container">
            <step1-search-filter @selectRepository="handleChangeRepository" />
            <div class="right-area">
                <p-field-title class="contents-title">
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.PLUGIN') }}
                </p-field-title>
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
    </div>
</template>

<script lang="ts" setup>
import { useInfiniteScroll } from '@vueuse/core';
import {
    onMounted, reactive, ref, watch,
} from 'vue';

import {
    PSearch, PDataLoader, PBoardItem, PButton, PI, PFieldTitle,
} from '@spaceone/design-system';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';
import { BACKGROUND_COLOR } from '@/styles/colorsets';

import Step1SearchFilter from '@/services/asset-inventory/collector/collector-create/modules/Step1SearchFilter.vue';
import type { RepositoryPluginModel } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectPluginContents
    from '@/services/asset-inventory/collector/shared/CollectorPluginContents.vue';

const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;


const state = reactive({
    searchValue: '',
    pluginList: [] as RepositoryPluginModel[],
    loading: false,
    selectedRepository: '',
    currentPage: 1,
    totalCount: 0,
});
const pluginCardListRef = ref<HTMLElement | null>(null);


const pluginApiQuery = new ApiQueryHelper();
const getPlugins = async (): Promise<RepositoryPluginModel[]> => {
    state.loading = true;
    try {
        pluginApiQuery.setPage(getPageStart(state.currentPage, 10), 10).setSort('name', false)
            .setFilters([{ v: state.searchValue }]);

        const params = {
            service_type: 'inventory.Collector',
            repository_id: state.selectedRepository === 'all' ? '' : state.selectedRepository,
            provider: collectorFormState.provider === 'all' ? null : collectorFormState.provider,
            query: pluginApiQuery.data,
        };
        const res = await SpaceConnector.client.repository.plugin.list(params);
        state.totalCount = res.total_count;
        return res.results;
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
    const additionalPlugin = await getPlugins();
    state.pluginList = state.pluginList.concat(additionalPlugin);
};

const handleSearch = async (value) => {
    state.searchValue = value;
    state.pluginList = await getPlugins();
};
const handleClickNextStep = (item: RepositoryPluginModel) => {
    emit('update:currentStep', 2);
    collectorFormStore.setRepositoryPlugin(item);
};
const handleChangeRepository = (value:string) => {
    state.selectedRepository = value;
};

watch([() => collectorFormState.provider, () => state.selectedRepository], async () => {
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
        @apply flex justify-between;
        margin-top: 1.5rem;

        .contents-title {
            margin-bottom: 0.5rem;
        }

        .right-area {
            max-width: 44.375rem;
            min-height: calc(100vh - 18rem);
            flex-grow: 1;
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


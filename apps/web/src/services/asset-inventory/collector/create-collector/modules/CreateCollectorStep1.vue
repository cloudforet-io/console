<template>
    <div class="collector-page-1">
        <p-search v-model="state.searchValue"
                  @search="handleSearch"
        />
        <div class="contents-container">
            <step1-search-filter />
            <p-data-loader class="right-area"
                           :data="state.pluginList"
                           :loading="state.loading"
                           :loader-backdrop-color="BACKGROUND_COLOR"
            >
                <div class="plugin-card-list">
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
                                    <!--                                    // TODO: translation-->
                                    {{ $t('Select') }}
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
import { reactive } from 'vue';

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

const emit = defineEmits([
    'update:currentStep',
]);

const collectorFormStore = useCollectorFormStore();


const state = reactive({
    searchValue: '',
    pluginList: [] as CollectorPluginModel[],
    loading: false,
});

const pluginApiQuery = new ApiQueryHelper();
const getPlugins = async () => {
    state.loading = true;
    try {
        pluginApiQuery.setPage(getPageStart(1, 10), 10).setSort('name', false)
            .setFilters([{ v: state.searchValue }]);

        // if (state.resourceTypeSearchTags.length) {
        //     pluginApiQuery.setFilters([{
        //         k: 'labels',
        //         v: state.resourceTypeSearchTags,
        //         o: '=',
        //     }]);
        // }
        const params = {
            service_type: 'inventory.Collector',
            repository_id: 'repo-f42c8b88ee2b',
            query: pluginApiQuery.data,
        };
        const res = await SpaceConnector.client.repository.plugin.list(params);
        state.pluginList = [
            ...res.results.map((d) => ({
                icon: assetUrlConverter(d.tags?.icon),
                ...d,
            })),
        ];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.pluginList = [];
    } finally {
        state.loading = false;
    }
};

const handleSearch = (value) => {
    console.log('value', value);
};
const handleClickNextStep = (item: CollectorPluginModel) => {
    emit('update:currentStep', 2);
    collectorFormStore.setPluginInfo(item);
};

(() => {
    getPlugins();
})();
</script>

<style lang="postcss" scoped>
.collector-page-1 {
    min-width: 59.5625rem;
    max-height: 100vh;
    width: 100%;
    .contents-container {
        @apply flex;
        height: calc(100vh - 18rem);
        margin-top: 1.5rem;

        .right-area {
            overflow-y: auto;
            max-width: 44.375rem;

            .plugin-card-list {
                @apply flex flex-col flex-wrap gap-2;
                :deep(.p-board-item) {
                    .content-area .content {
                        flex-grow: unset;
                        width: 100%;
                    }
                }

                .plugin-card-item {
                    border-radius: 0.375rem;
                    width: 100%;

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


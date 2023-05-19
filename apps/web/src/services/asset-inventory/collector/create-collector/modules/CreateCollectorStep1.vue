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
                                <div class="left-contents">
                                    <p-lazy-img :src="item.icon"
                                                class="plugin-icon"
                                                width="2.5rem"
                                                height="2.5rem"
                                    />
                                    <div class="contents">
                                        <p class="plugin-name">
                                            {{ item.name }} <span v-if="isBeta(item)"
                                                                  class="beta"
                                            >{{ $t('beta') }}</span>
                                        </p>
                                        <div class="plugin-description">
                                            <span class="plugin-description-text">
                                                {{ item.tags.description }}
                                            </span><p-anchor size="sm"
                                                             :highlight="true"
                                            >
                                                {{ $t('learn more') }}
                                            </p-anchor>
                                        </div>
                                        <div v-if="item.labels">
                                            <p-label v-for="(label, idx) in item.labels"
                                                     :key="`${label}-${idx}`"
                                                     class="mr-2 mb-2"
                                                     :text="label"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p-button style-type="secondary"
                                          class="create-button"
                                >
                                    {{ $t('Select') }}
                                </p-button>
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
    PSearch, PDataLoader, PBoardItem, PLazyImg, PButton, PLabel, PAnchor,
} from '@spaceone/design-system';
import { get } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import Step1SearchFilter from '@/services/asset-inventory/collector/create-collector/modules/Step1SearchFilter.vue';

const state = reactive({
    searchValue: '',
    pluginList: [] as any[],
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
const isBeta = (item) => get(item, 'tags.beta', '');

const handleSearch = (value) => {
    console.log('value', value);
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

                .plugin-card-item {
                    border-radius: 0.375rem;
                    width: 100%;
                    .plugin-card-content {
                        @apply flex justify-between;
                        width: 100%;
                        .left-contents {
                            @apply flex items-center;
                            width: 100%;
                            .plugin-icon {
                                margin-right: 1.5rem;
                            }
                            .contents {
                                @apply flex flex-col;
                                width: 100%;

                                .plugin-name {
                                    @apply text-label-md text-gray-900 flex;
                                    margin-bottom: 0.25rem;
                                    .beta {
                                        @apply text-label-xs text-coral-500 font-normal;
                                    }
                                }
                                .plugin-description {
                                    @apply inline-flex items-end gap-1;
                                    width: 100%;
                                    .plugin-description-text {
                                        @apply text-label-sm text-gray-500 truncate;
                                        max-width: 18.75rem;
                                        flex-shrink: 0;
                                    }
                                }
                            }
                        }
                        .create-button {
                            flex-shrink: 0;
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
            .plugin-description {
                @apply inline-flex items-end gap-1 flex-wrap;
                width: 100%;
                .plugin-description-text {
                    @apply text-label-sm text-gray-500 truncate;
                    max-width: 18.75rem;
                    flex-shrink: 0;
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


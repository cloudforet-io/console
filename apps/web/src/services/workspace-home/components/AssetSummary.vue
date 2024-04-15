<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';

import {
    PFieldTitle, PIconButton, PDivider, PLink, PEmpty,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssetSummaryDailyUpdateItem from '@/services/workspace-home/components/AssetSummaryDailyUpdateItem.vue';
import AssetSummaryItem from '@/services/workspace-home/components/AssetSummaryItem.vue';
import { WORKSPACE_HOME_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { CloudServiceData, ProviderResourceDataItem, ProviderReferenceDataMap } from '@/services/workspace-home/types/workspace-home-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const providerEl = ref<null | HTMLElement>(null);
const dailyUpdateEl = ref<null | HTMLElement>(null);

const apiQueryHelper = new ApiQueryHelper();

const storeState = reactive({
    providerMap: computed<ProviderReferenceDataMap>(() => allReferenceGetters.provider),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
});
const state = reactive({
    providers: [] as ProviderResourceDataItem[],
    dailyUpdatesList: [] as CloudServiceData[],
    pageStart: {
        provider: 0,
        dailyUpdate: 0,
    },
    pageMax: {
        provider: computed<number>(() => Math.ceil(state.providers.length / 3) - 1),
        dailyUpdate: computed<number>(() => Math.ceil(state.dailyUpdatesList.length / 4) - 1),
    },
});

const handleClickArrowButton = (type: string, direction: string) => {
    const element = type === 'provider' ? providerEl.value : dailyUpdateEl.value;
    if (!element) return;

    const increment = direction === 'right' ? 1 : -1;
    state.pageStart[type] += increment;

    const marginLeft = state.pageStart[type] * 576;
    element.style.marginLeft = direction === 'right' ? `-${marginLeft}px` : `${marginLeft}px`;
};
const getApiParameter = (type) => {
    apiQueryHelper.setSort('count', true);
    const defaultParam: any = {
        labels: [type],
        query: apiQueryHelper.data,
    };

    if (type !== WORKSPACE_HOME_DATA_TYPE.STORAGE) {
        return {
            ...defaultParam,
            is_primary: true,
        };
    }

    // STORAGE
    apiQueryHelper.setSort('size', true);
    return {
        ...defaultParam,
        is_major: true,
        query: apiQueryHelper.data,
        fields: [{
            name: 'size',
            operator: 'sum',
            key: 'data.size',
        }],
    };
};

const fetchDailyUpdatesList = async (): Promise<void> => {
    try {
        const { results } = await SpaceConnector.client.statistics.topic.dailyUpdateCloudService({
            timezone: store.state.user.timezone,
            workspace_id: storeState.currentWorkspaceId,
        });
        state.dailyUpdatesList = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.dailyUpdatesList = [];
    }
};
const fetchCloudServiceResources = async () => {
    const labels = ['Server', 'Database', 'Storage'];
    try {
        await Promise.all(labels.map(async (label) => {
            const param = getApiParameter(label);
            const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                ...param,
                workspace_id: storeState.currentWorkspaceId,
            });
            if (label !== 'Storage') {
                (results || []).forEach((i) => {
                    storeState.providerMap[i.provider][label.toLowerCase()] = i.count;
                });
            } else {
                (results || []).forEach((i) => {
                    storeState.providerMap[i.provider][label.toLowerCase()] += i.size;
                });
            }
        }));
        state.providers = Object.keys(storeState.providerMap).map((key) => storeState.providerMap[key]);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => storeState.providerMap, () => {
    fetchCloudServiceResources();
}, { immediate: true });

onMounted(() => {
    fetchDailyUpdatesList();
});
</script>

<template>
    <div class="asset-summary">
        <p-field-title :label="$t('HOME.ASSET_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div class="content-wrapper">
            <div class="row-items-wrapper">
                <div ref="providerEl"
                     class="row-items-container"
                >
                    <asset-summary-item v-for="(item, idx) in state.providers"
                                        :key="`asset-summary-item-${idx}`"
                                        :item="item"
                    />
                </div>
                <div class="arrow-button-wrapper">
                    <p-icon-button v-if="state.pageStart.provider !== 0"
                                   class="arrow-button left"
                                   name="ic_chevron-left"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickArrowButton('provider', 'left')"
                    />
                    <p-icon-button v-if="state.pageStart.provider !== Number(state.pageMax.provider)"
                                   class="arrow-button right"
                                   name="ic_chevron-right"
                                   color="inherit transparent"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickArrowButton('provider', 'right')"
                    />
                </div>
            </div>
            <div class="daily-update-wrapper">
                <p-field-title :label="$t('HOME.ASSET_SUMMARY_DAILY_UPDATE_TITLE')"
                               class="daily-update-title"
                >
                    <template #right>
                        <span class="desc">{{ $t('HOME.ASSET_SUMMARY_DAILY_UPDATE_DESC') }}</span>
                    </template>
                </p-field-title>
                <div v-if="state.dailyUpdatesList.length > 0"
                     class="row-items-wrapper"
                >
                    <div ref="dailyUpdateEl"
                         class="row-items-container"
                    >
                        <asset-summary-daily-update-item v-for="(item, idx) in state.dailyUpdatesList"
                                                         :key="`asset-summary-daily-update-item-${idx}`"
                                                         :item="item"
                        />
                    </div>
                    <div class="arrow-button-wrapper">
                        <p-icon-button v-if="state.pageStart.dailyUpdate !== 0"
                                       class="arrow-button left"
                                       name="ic_chevron-left"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                                       @click="handleClickArrowButton('dailyUpdate', 'left')"
                        />
                        <p-icon-button v-if="state.pageStart.dailyUpdate !== Number(state.pageMax.dailyUpdate)"
                                       class="arrow-button right"
                                       name="ic_chevron-right"
                                       color="inherit transparent"
                                       width="1.5rem"
                                       height="1.5rem"
                                       @click="handleClickArrowButton('dailyUpdate', 'right')"
                        />
                    </div>
                </div>
                <p-empty v-else
                         show-image
                         image-size="sm"
                         :title="$t('COMMON.WIDGETS.DAILY_UPDATE_NO_DATA')"
                         class="empty"
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_circle_boy.svg"
                        >
                    </template>
                </p-empty>
            </div>
        </div>
        <p-divider />
        <p-link highlight
                action-icon="internal-link"
                class="link"
        >
            <span>{{ $t('HOME.ASSET_SUMMARY_SHOW_MORE_DAILY_UPDATE') }}</span>
        </p-link>
    </div>
</template>

<style scoped lang="postcss">
.asset-summary {
    .main-title {
        padding-left: 1rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding-top: 1.375rem;
        padding-bottom: 2.375rem;
        gap: 1.75rem;
        .row-items-wrapper {
            @apply relative overflow-hidden;
            .row-items-container {
                @apply flex overflow-hidden;
                gap: 0.5rem;
                padding-left: 1.5rem;
                transition: margin-left 0.3s ease;
            }
            &::after {
                @apply absolute;
                content: '';
                top: 0;
                right: 0;
                width: 2rem;
                height: 100%;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
            }
            .arrow-button-wrapper {
                @apply absolute flex;
                top: calc(50% - 1rem);
                right: 0.75rem;
                left: 0.5rem;
                width: calc(100% - 1.25rem);
                z-index: 10;
                .arrow-button {
                    @apply bg-white border border-gray-300 rounded-full;
                    width: 2rem;
                    height: 2rem;
                    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
                    &.left {
                        margin-right: auto;
                    }
                    &.right {
                        margin-left: auto;
                    }
                }
            }

            /* custom design-system component - p-empty */
            :deep(.p-empty) {
                .image-wrapper {
                    margin-bottom: 0.5rem;
                }
            }
        }
        .daily-update-wrapper {
            @apply flex flex-col;
            gap: 0.75rem;
            .daily-update-title {
                padding-left: 1.5rem;
                .desc {
                    @apply text-label-sm text-gray-600;
                }
            }

            /* custom design-system component - p-field-title */
            :deep(.p-field-title) {
                .title-wrapper {
                    @apply items-center;
                    gap: 0.5rem;
                }
            }
        }
        .empty {
            @apply border border-gray-150 rounded-md;
            width: calc(100% - 3rem);
            height: 10rem;
            margin-left: 1.5rem;
        }
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>

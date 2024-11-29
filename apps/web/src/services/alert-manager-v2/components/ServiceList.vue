<script setup lang="ts">
import { computed, reactive } from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import {
    PDivider, PSelectCard, PToolbox, PI, PTextButton,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/src/controls/toolbox/type';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';

import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

const pageSizeOptions = [15, 30, 45];

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }]),
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.Service', 'name'),
    } as ValueHandlerMap,
});
const state = reactive({
    pageStart: 1,
    pageLimit: 15,
    queryTags: computed<QueryTag[]>(() => queryTagsHelper.queryTags.value),
});

const queryTagsHelper = useQueryTags({
    referenceStore: {},
    keyItemSets: handlerState.keyItemSets,
});

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagsHelper.setQueryTags(options.queryTags);
    if (options.pageLimit !== undefined) {
        state.pageLimit = options.pageLimit;
        state.pageStart = 1;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleClickEscalationPolicy = () => {
    console.log('TODO: handleClickEscalationPolicy');
};
const handleClickServiceItem = () => {
    console.log('TODO: handleClickServiceItem');
};
const handleClickWebhookItem = (item: string) => {
    if (item === 'chevron') {
        console.log('TODO: route to webhook main page');
    } else {
        console.log('TODO: route to webhook detail page');
    }
};

const fetchServiceList = () => {
    console.log('TODO: fetchServiceList');
};
</script>

<template>
    <div class="service-list">
        <p-toolbox search-type="query"
                   searchable
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="state.pageLimit"
                   :query-tags="state.queryTags"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChangeToolbox"
                   @refresh="fetchServiceList"
        />
        <div class="list-card-wrapper">
            <p-select-card class="card"
                           @change="handleClickServiceItem"
            >
                <div class="card-inner-wrapper">
                    <p class="text-label-xl font-bold">
                        temp name
                    </p>
                    <div class="contents">
                        <div class="alerts-wrapper">
                            <div class="alerts">
                                <p class="title text-gray-700">
                                    {{ $t('ALERT_MANAGER.SERVICE.OPEN_ALERTS') }}
                                </p>
                                <p class="count font-medium">
                                    725
                                </p>
                            </div>
                            <p-divider />
                            <div class="alerts triggered text-red-500">
                                <p class="title">
                                    {{ $t('ALERT_MANAGER.ALERTS.TRIGGERED') }}
                                </p>
                                <div class="triggered-info">
                                    <p class="count">
                                        50
                                    </p>
                                    <div class="ml-2">
                                        <p-i name="ic_error-filled"
                                             :color="red[400]"
                                             width="1rem"
                                             height="1rem"
                                        />
                                        <span class="text-gray-900 pl-1">{{ $t('ALERT_MANAGER.ALERTS.HIGH') }}:</span>
                                        <span> 4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="additional-info-wrapper">
                            <div>
                                <p class="title">
                                    {{ $t('ALERT_MANAGER.SERVICE.WEBHOOK', { cnt: 11 }) }}
                                </p>
                                <div class="webhook-list">
                                    <!-- TODO: check the link & icon -->
                                    <span class="webhook"
                                          @click.stop="handleClickWebhookItem('item')"
                                    >
                                        <p-i name="ic_check"
                                             class="icon success"
                                             height="0.875rem"
                                             width="0.875rem"
                                             color="inherit"
                                        />
                                    </span>
                                    <span class="webhook chevron"
                                          @click.stop="handleClickWebhookItem('chevron')"
                                    >
                                        <p-i
                                            name="ic_chevron-right"
                                            width="1.125rem"
                                            height="1.125rem"
                                            color="inherit"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="title">
                                    {{ $t('ALERT_MANAGER.ESCALATION_POLICY.TITLE', { cnt: 11 }) }}
                                </p>
                                <p-text-button @click.stop="handleClickEscalationPolicy">
                                    temp default policy
                                </p-text-button>
                            </div>
                        </div>
                    </div>
                </div>
            </p-select-card>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-list {
    @apply flex flex-col;
    gap: 0.5rem;
    .list-card-wrapper {
        @apply flex flex-wrap;
        gap: 1rem;
        .card {
            min-width: 30rem;
            max-width: 28rem;
            padding: 1.25rem 1.5rem 1.5rem;
            .card-inner-wrapper {
                @apply flex flex-col w-full;
                gap: 1.75rem;
                .contents {
                    @apply flex justify-between;
                    .alerts-wrapper {
                        @apply flex flex-col;
                        flex: 1;
                        max-width: 12.25rem;
                        gap: 0.75rem;
                        .alerts {
                            @apply relative flex flex-col;
                            gap: 0.25rem;
                            .title {
                                @apply text-label-md;
                            }
                            .count {
                                @apply text-display-md;
                            }
                            .triggered-info {
                                @apply flex items-center;
                            }
                            &.triggered {
                                padding-left: 0.625rem;
                                &::before {
                                    @apply absolute bg-red-500;
                                    content: '';
                                    width: 0.125rem;
                                    height: 100%;
                                    top: 0;
                                    left: 0;
                                }
                            }
                        }
                    }
                    .additional-info-wrapper {
                        min-width: 7.75rem;
                        .title {
                            @apply text-paragraph-md text-gray-600;
                        }
                        .webhook-list {
                            @apply flex items-center;
                            .webhook {
                                @apply flex items-center justify-center rounded-full bg-gray-100 border border-white ;
                                width: 1.5rem;
                                height: 1.5rem;
                                &:hover {
                                    @apply bg-blue-200;
                                }
                                & + .webhook {
                                    margin-left: -0.25rem;
                                }
                                &.chevron {
                                    @apply border-gray-200;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>

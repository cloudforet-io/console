<template>
    <div class="cloud-service-history-changes-tab">
        <p-heading heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES')"
                   use-total-count
                   :total-count="changesCount"
        />
        <div class="cloud-service-history-changes-wrapper">
            <nav class="cloud-service-history-changes-key-nav">
                <p-card :header="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.CHANGED_KEYS')">
                    <p-context-menu :menu="keyMenus"
                                    :selected="[{name: selectedKeyMenu}]"
                                    @select="handleSelect"
                    >
                        <template #item--format="{ item }">
                            <div class="item-row">
                                <span class="text">{{ item.label }}</span>
                                <p-i v-if="item.updateType === 'ADDED'"
                                     name="ic_plus"
                                     color="#60B731"
                                     width="1rem"
                                     height="1rem"
                                     class="p-i-ic_plus"
                                />
                            </div>
                        </template>
                    </p-context-menu>
                </p-card>
            </nav>
            <nav class="cloud-service-history-changes-code-nav">
                <p-card>
                    <template #header>
                        <div class="cloud-service-history-changes-code-header-wrapper">
                            <div>
                                <span v-for="(path, index) in selectedKeyPath.split('.')"
                                      :key="index"
                                      class="inline-flex items-center"
                                >
                                    <span class="text-gray-500">
                                        <p-i v-if="selectedKeyMenu && index !== 0"
                                             name="ic_chevron-right"
                                             color="inherit"
                                             scale="0.7"
                                        />
                                    </span>
                                    <span :class="index === selectedKeyPath.split('.').length - 1 ? 'text-gray-900' : 'text-gray-700'">{{ path }}</span>
                                </span>
                            </div>
                            <p-i width="1rem"
                                 height="1rem"
                                 :name="folding ? 'ic_arrows-expand-vertical' : 'ic_arrows-collapse-vertical'"
                                 class="cursor-pointer"
                                 @click="handleCodeDisplayType"
                            />
                        </div>
                    </template>
                    <div class="secondary-header">
                        <div>{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.PREVIOUS') }}</div>
                        <div>{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.CHANGED') }}</div>
                    </div>
                    <div class="cloud-service-history-changes-code-area">
                        <vue-diff :prev="previousValue"
                                  :current="changedValue"
                                  :folding="folding"
                        />
                    </div>
                </p-card>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PHeading, PCard, PContextMenu, PI,
} from '@spaceone/design-system';

import vueDiff from '@/common/components/forms/vue-diff/Diff.vue';

import type {
    CloudServiceHistoryItem,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

export default defineComponent({
    name: 'CloudServiceHistoryChangesTab',
    components: {
        vueDiff,
        PHeading,
        PCard,
        PContextMenu,
        PI,
    },
    props: {
        selectedHistoryItem: {
            type: Object as PropType<CloudServiceHistoryItem>,
            default: () => ({}),
        },
        selectedKeyName: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            keyMenus: computed(() => props.selectedHistoryItem?.diffItems?.map((data) => ({
                label: data.key, name: data.key, updateType: data.type, path: data.path,
            })) ?? []),
            selectedKeyMenu: props.selectedKeyName || props.selectedHistoryItem?.diffItems?.at(0)?.key || '',
            selectedKeyPath: props.selectedHistoryItem?.diffItems?.at(0)?.path || '',
            filteredDiffItem: computed(() => props.selectedHistoryItem?.diffItems?.filter((d) => d.key === state.selectedKeyMenu) ?? []),
            previousValue: computed(() => valueConverter(state.filteredDiffItem[0]?.previousValue)),
            changedValue: computed(() => valueConverter(state.filteredDiffItem[0]?.changedValue)),
            changesCount: computed(() => props.selectedHistoryItem?.diffCount ?? 0),
            folding: false,
        });

        const valueConverter = (value) => {
            if (typeof value === 'string' && value.length) {
                if (value.startsWith('{') || value.startsWith('[')) {
                    try {
                        return JSON.stringify(JSON.parse(value), undefined, 2);
                    } catch {
                        return undefined;
                    }
                }
                return value;
            }
            return undefined;
        };

        const handleSelect = (menu) => {
            state.selectedKeyMenu = menu.label;
            state.selectedKeyPath = menu.path;
        };

        const handleCodeDisplayType = () => { state.folding = !state.folding; };

        watch(() => props.selectedHistoryItem, (d) => {
            state.selectedKeyMenu = d?.diffItems?.at(0)?.key || '';
        });

        return {
            ...toRefs(state),
            handleCodeDisplayType,
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-history-changes-tab {
    height: 100%;
    .cloud-service-history-changes-wrapper {
        @apply flex;
        height: calc(100% - 3.5rem);
        padding: 1rem;
        .cloud-service-history-changes-key-nav {
            width: 20%;

            .item-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .text {
                    @apply truncate;
                    width: 90%;
                }
            }

            /* custom design-system component - p-context-menu */
            :deep(.p-context-menu) {
                height: 100%;
                border: none;
                & span {
                    border-radius: 0.25rem;
                }
                .menu-container {
                    padding: 0.75rem 0.875rem 0;
                }
            }

            /* custom design-system component - p-card */
            :deep(.p-card) {
                height: 100%;

                header {
                    @apply border-gray-200 border-solid border border-b;
                    height: 2.25rem;
                    border-top-right-radius: 0;
                }
                .body {
                    height: calc(100% - 2.25rem);
                    border-bottom-right-radius: 0;
                    padding: 0;
                }
            }
            .p-i-ic_plus {
                @apply border-green-600 border border-solid;
                border-radius: 0.25rem;
            }
        }
        .cloud-service-history-changes-code-nav {
            width: 80%;

            /* custom design-system component - p-card */
            :deep(.p-card) {
                height: 100%;
                header {
                    @apply flex items-center border border-b border-solid;
                    height: 2.25rem;
                    border-top-left-radius: 0;
                    border-left: 0;
                }
                .secondary-header {
                    @apply flex;
                    height: 1.625rem;
                    & > :last-child {
                        @apply border-solid border-l;
                    }
                    div {
                        @apply bg-gray-100 text-sm text-gray-500 w-1/2 border-gray-200 border-b border-solid;
                        padding: 0.25rem 0.75rem;
                    }
                }
                .body {
                    @apply border-l-0;
                    border-bottom-left-radius: 0;
                    height: calc(100% - 2.25rem);
                    padding: 0;
                }
                .cloud-service-history-changes-code-area {
                    height: calc(100% - 1.5rem);
                }
                .cloud-service-history-changes-code-header-wrapper {
                    @apply flex justify-between w-full align-middle text-sm;
                }
            }
        }
    }
}

@screen tablet {
    .cloud-service-history-changes-tab {
        height: 30rem;
    }
}

@screen mobile {
    .cloud-service-history-changes-tab {
        height: 56rem;
        .cloud-service-history-changes-wrapper {
            flex-flow: column;
            & nav {
                width: 100% !important;
            }
            .cloud-service-history-changes-key-nav {
                /* custom design-system component - p-card */
                :deep(.p-card) {
                    .body {
                        max-height: 11.25rem;
                        overflow-y: scroll;
                        border-radius: 0;
                    }
                }
            }
            .cloud-service-history-changes-code-nav {
                height: 3.5rem;

                /* custom design-system component - p-card */
                :deep(.p-card) {
                    @apply border-l border-gray-200;
                    header {
                        height: 100%;
                        border-radius: 0;
                        border-top: none;
                    }
                    .body {
                        @apply border-gray-200 rounded-bl-md;
                        height: 33rem;
                        border-left-width: 1px;
                    }
                    .cloud-service-history-changes-code-header-wrapper {
                        @apply w-full align-middle flex-col gap-1;
                        & div {
                            display: inline-flex !important;
                            &:last-child {
                                @apply justify-end;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>

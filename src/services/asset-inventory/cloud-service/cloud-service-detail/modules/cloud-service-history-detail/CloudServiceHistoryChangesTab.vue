<template>
    <div class="cloud-service-history-changes-tab">
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES')" use-total-count :total-count="changesCount" />
        <div class="cloud-service-history-changes-wrapper">
            <nav class="cloud-service-history-changes-key-nav">
                <p-card :header="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.CHANGED_KEYS')">
                    <p-context-menu :menu="keyMenus" :selected="[{name: selectedKeyMenu}]" @select="handleSelect">
                        <template #item--format="{ item }">
                            <div class="flex justify-between items-center">
                                <span>{{ item.label }}</span>
                                <p-i v-if="item.updateType === 'ADDED'" name="ic_plus" color="#60B731"
                                     width="1rem" height="1rem" class="p-i-ic_plus"
                                />
                            </div>
                        </template>
                    </p-context-menu>
                </p-card>
            </nav>
            <nav class="cloud-service-history-changes-code-nav">
                <p-card>
                    <template #header>
                        <div class="flex justify-between w-full align-middle">
                            <div>
                                <span>data</span>
                                <p-i v-if="selectedKeyMenu" name="ic_arrow_right" color="#898995"
                                     scale="0.8"
                                />
                                <span>{{ selectedKeyMenu }}</span>
                            </div>
                            <div>
                                <span>{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.HIDE_UNCHANGED') }}</span>
                                <p-check-box v-model="folding" />
                            </div>
                        </div>
                    </template>
                    <div class="secondary-header">
                        <div>{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.PREVIOUS') }}</div>
                        <div>{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES_TAB.CHANGED') }}</div>
                    </div>
                    <div class="cloud-service-history-changes-code-area">
                        <vue-diff :prev="previousValue" :current="changedValue" :folding="folding" />
                    </div>
                </p-card>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, PropType, reactive, toRefs,
} from '@vue/composition-api';

import {
    PPanelTop, PCard, PContextMenu, PI, PCheckBox,
} from '@spaceone/design-system';

import vueDiff from '@/common/components/forms/vue-diff/Diff.vue';

import type {
    CloudServiceHistoryItem,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

export default defineComponent({
    name: 'CloudServiceHistoryChangesTab',
    components: {
        vueDiff,
        PPanelTop,
        PCard,
        PContextMenu,
        PI,
        PCheckBox,
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
            keyMenus: computed(() => props.selectedHistoryItem?.diffItems?.map(d => ({ label: d.key, name: d.key, updateType: d.type })) ?? []),
            // TODO:: set selectedKeyMenu as computed
            selectedKeyMenu: props.selectedKeyName || props.selectedHistoryItem?.diffItems?.at(0)?.key || '',
            changesCount: computed(() => props.selectedHistoryItem?.diffCount ?? 0),
            filteredDiffItem: computed(() => props.selectedHistoryItem?.diffItems?.filter(d => d.key === state.selectedKeyMenu) ?? []),
            previousValue: computed(() => valueConverter(state.filteredDiffItem[0]?.previousValue)),
            changedValue: computed(() => valueConverter(state.filteredDiffItem[0]?.changedValue)),
            folding: true,
        });

        const valueConverter = (value) => {
            if (typeof value === 'string' && value.length) {
                if (value.startsWith('{') || value.startsWith('[')) {
                    return JSON.stringify(JSON.parse(value), undefined, 2);
                }
                return value;
            }
            return undefined;
        };

        const handleSelect = (menu) => { state.selectedKeyMenu = menu.label; };

        return {
            ...toRefs(state),
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-history-changes-tab {
    .cloud-service-history-changes-wrapper {
        @apply flex;
        padding: 0 17px;
        .cloud-service-history-changes-key-nav {
            width: 20%;
            .p-card::v-deep {
                header {
                    @apply border-gray-200 border-solid border border-b h-8;
                    border-top-right-radius: 0;
                }
                .body {
                    height: 50vh;
                    border-bottom-right-radius: 0;
                }
                .p-context-menu {
                    border: none;
                }
            }
            .p-i-ic_plus {
                @apply border-green-600 border border-solid;
                border-radius: 4px;
            }
        }
        .cloud-service-history-changes-code-nav {
            width: 80%;
            .p-card::v-deep {
                header {
                    @apply flex items-center h-8 border border-b border-solid;
                    border-top-left-radius: 0;
                    border-left: 0;
                }
                .secondary-header {
                    @apply flex;
                    & > :last-child {
                        @apply border-solid border-l;
                    }
                    div {
                        @apply bg-gray-100 text-sm text-gray-500 w-1/2 border-gray-200 border-b border-solid;
                        padding: 4px 12px;
                    }
                }
                .body {
                    height: 50vh;
                    border-bottom-left-radius: 0;
                    border-left: 0;
                    padding: 0;
                }
                .cloud-service-history-changes-code-area {
                    height: calc(100% - 25px);
                }
            }
        }
    }
}
</style>

<template>
    <div class="cloud-service-history-changes-tab">
        <!--        song-lang-->
        <p-panel-top title="Changes" use-total-count :total-count="changesCount" />
        <div class="cloud-service-history-changes-wrapper">
            <nav class="cloud-service-history-changes-key-nav">
                <!--            song-lang-->
                <p-card header="Changed Keys">
                    <p-context-menu :menu="keyMenus" @select="handleSelect" />
                </p-card>
            </nav>
            <nav class="cloud-service-history-changes-code-nav">
                <!--                <p-card :header="`data > ${selectedKeyMenu}`">-->
                <p-card>
                    <template #header>
                        <span>data</span>
                        <p-i v-if="selectedKeyMenu" name="ic_arrow_right" color="#898995"
                             scale="0.8"
                        />
                        <span>{{ selectedKeyMenu }}</span>
                    </template>
                    <div class="secondary-header">
                        <div>Previous</div>
                        <div>Changed</div>
                    </div>
                    <div class="cloud-service-history-changes-code-area">
                        <vueDiff :prev="previousValue" :current="changedValue" />
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
    PPanelTop, PCard, PContextMenu, PI,
} from '@spaceone/design-system';

import vueDiff from '@/common/components/forms/vue-diff/Diff.vue';

import type { CloudServiceHistoryItem } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

export default defineComponent({
    name: 'CloudServiceHistoryChangesTab',
    components: {
        vueDiff,
        PPanelTop,
        PCard,
        PContextMenu,
        PI,
    },
    props: {
        selectedHistoryItem: {
            type: Object as PropType<CloudServiceHistoryItem>,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            selectedKeyMenu: '',
            keyMenus: computed(() => props.selectedHistoryItem?.diffItems?.map(d => ({ label: d.key, name: d.key })) ?? []),
            changesCount: computed(() => props.selectedHistoryItem?.diffCount ?? 0),
            filteredDiffItem: computed(() => props.selectedHistoryItem?.diffItems?.filter(d => d.key === state.selectedKeyMenu) ?? []),
            previousValue: computed(() => JSON.stringify(state.filteredDiffItem[0]?.previousValue ?? '', undefined, 4)),
            changedValue: computed(() => JSON.stringify(state.filteredDiffItem[0]?.changedValue ?? '', undefined, 4)),
        });

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
        }
        .cloud-service-history-changes-code-nav {
            width: 80%;
            .p-card::v-deep {
                header {
                    @apply flex items-center;
                    border-top-left-radius: 0;
                    border-left: 0;
                }
                .secondary-header {
                    @apply flex;
                    div {
                        @apply bg-gray-700 text-gray-200 text-sm w-1/2;
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

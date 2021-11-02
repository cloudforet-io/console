<template>
    <p-button-modal
        class="select-filter-modal-container"
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECT_FILTER')"
        :visible.sync="proxyVisible"
        :footer-reset-button-visible="true"
        @confirm="handleFormConfirm"
        @return="handleClearAll"
    >
        <template #body>
            <div class="select-filter-body">
                <div class="left-select-filter-section">
                    <p-collapsible-list
                        class="collapsible-list-section"
                        :items="Object.keys(SELECT_FILTER_TYPE)"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                    >
                        <template #title="{data}">
                            {{ SELECT_FILTER_TYPE[data] }}
                        </template>
                        <template #default="{data}">
                            <p-search-dropdown
                                class="search-dropdown-item"
                                :menu="filterMenuState[data].filterItems"
                                :selected="filterMenuState[data].selectedItems"
                                type="checkbox"
                                :show-selected-list="true"
                                use-fixed-menu-style
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="more-filter-wrapper">
                        <div class="more-filter-content">
                            <p class="top-wrapper">
                                <span class="title">
                                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MORE_FILTERS') }}
                                </span>
                                <p-collapsible-toggle :is-collapsed="!moreFilterIsCollapsed"
                                                      toggle-type="switch"
                                                      @update:isCollapsed="handleUpdateCollapsed"
                                />
                            </p>
                            <p-collapsible-panel v-show="moreFilterIsCollapsed"
                                                 :is-collapsed="moreFilterIsCollapsed"
                                                 @update:isCollapsed="handleUpdateCollapsed"
                            >
                                <p-autocomplete-search
                                    class="search-dropdown"
                                    :menu="filterMenuState.moreFilter.filterItems"
                                    :selected="filterMenuState.moreFilter.selectedItems"
                                    type="checkbox"
                                    :show-selected-list="true"
                                    use-fixed-menu-style
                                />
                            </p-collapsible-panel>
                        </div>
                    </div>
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SELECTED_FILTER') }} ({{ selectedFilterTags.length }})
                        </div>
                        <div class="selected-tags-wrapper">
                            <p-tag v-for="(tag, idx) in selectedFilterTags" :key="`selected-tag-${idx}`" @delete="handleDeleteSelectedTag">
                                {{ tag.label }}
                            </p-tag>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #reset-button>
            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.CLEAR_ALL') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    PButtonModal,
    PCollapsibleList,
    PSearchDropdown,
    PCollapsibleToggle,
    PCollapsiblePanel,
    PAutocompleteSearch,
    PTag,
} from '@spaceone/design-system';
import { makeProxy } from '@/lib/helper/composition-helpers';

const SELECT_FILTER_TYPE = Object.freeze({
    project: 'Project',
    serviceAccount: 'Service Account',
    provider: 'Provider',
    resourceId: 'Resource ID',
    product: 'Product',
    region: 'Region',
    account: 'Account',
    type: 'Type',
    tag: 'Tag',
});

interface SelectedTag {
    label?: string;
    key?: typeof SELECT_FILTER_TYPE | null;
}

export default {
    name: 'CostAnalysisSelectFilterModal',
    components: {
        PButtonModal,
        PCollapsibleList,
        PSearchDropdown,
        PCollapsibleToggle,
        PCollapsiblePanel,
        PAutocompleteSearch,
        PTag,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const filterMenuState = reactive({
            project: {
                filterItems: [],
                selectedItems: [],
            },
            serviceAccount: {
                filterItems: [],
                selectedItems: [],
            },
            provider: {
                filterItems: [],
                selectedItems: [],
            },
            resourceId: {
                filterItems: [],
                selectedItems: [],
            },
            product: {
                filterItems: [],
                selectedItems: [],
            },
            region: {
                filterItems: [],
                selectedItems: [],
            },
            account: {
                filterItems: [],
                selectedItems: [],
            },
            type: {
                filterItems: [],
                selectedItems: [],
            },
            tag: {
                filterItems: [],
                selectedItems: [],
            },
            moreFilter: {
                filterItems: [],
                selectedItems: [],
            },
        });

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            moreFilterIsCollapsed: false,
            selectedFilterTags: computed<SelectedTag[]>(() => filterMenuState.project.selectedItems), // combine all selectedFilterTags
        });

        const handleFormConfirm = () => {
            state.proxyVisible = false;
            emit('confirm');
        };

        const handleClearAll = () => {
            console.log('Clear All');
        };

        const handleUpdateCollapsed = () => {
            state.moreFilterIsCollapsed = !state.moreFilterIsCollapsed;
            console.log('switch on/off');
        };

        const handleDeleteSelectedTag = () => {
            console.log('delete tag');
        };
        return {
            ...toRefs(state),
            handleFormConfirm,
            handleClearAll,
            handleUpdateCollapsed,
            handleDeleteSelectedTag,
            filterMenuState,
            SELECT_FILTER_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.select-filter-modal-container {
    .select-filter-body {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid grid-cols-1;
        }

        .left-select-filter-section {
            @apply bg-gray-100 border border-solid border-gray-200 rounded;
            padding: 0.5rem;
            .collapsible-list-section {
                @apply flex flex-wrap flex-col gap-1;
                >>> .collapsible-item {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    > .p-collapsible-panel {
                        > .contents {
                            @apply rounded-lg bg-blue-100;
                            padding: 0.75rem;
                            margin-top: 0.25rem;
                            .p-tag {
                                margin-bottom: 0;
                            }
                        }
                    }
                }
            }
        }
        .right-select-filter-section {
            @apply flex flex-col flex-wrap gap-4;
            .more-filter-wrapper {
                @apply bg-gray-100 border border-solid border-gray-200 rounded-lg;
                padding: 0.5rem;
                .more-filter-content {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    overflow: auto;
                    .top-wrapper {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.5rem 0;
                        .title {
                            line-height: 1.25;
                        }
                    }
                    >>> .p-collapsible-panel {
                        @apply bg-blue-100 rounded-lg;
                        padding: 0.75rem;
                        margin-top: 0.25rem;
                        margin-bottom: 1rem;
                    }
                }
            }

            .selected-filter-section {
                min-height: 11rem;
                border: 1px solid #e5e5e8;
                box-sizing: border-box;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
                padding: 1rem;
            }
        }
    }
}
</style>

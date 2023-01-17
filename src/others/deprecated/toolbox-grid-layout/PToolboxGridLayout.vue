<template>
    <div class="p-toolbox-grid-layout">
        <div class="toolbox">
            <div class="toolbox-top">
                <slot name="toolbox-top" />
            </div>
            <div class="toolbox-middle">
                <div class="left">
                    <slot name="toolbox-left" />
                </div>
                <div v-if="$slots['toolbox-center']"
                     class="center"
                >
                    <slot name="toolbox-center" />
                </div>
                <div class="right">
                    <slot name="toolbox-right" />
                    <div v-if="paginationVisible"
                         class="tool"
                    >
                        <p-text-pagination
                            :this-page.sync="proxyState.thisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <slot v-if="pageSizeVisible"
                          name="page-size"
                    >
                        <div class="tool">
                            <p-select-dropdown class="page-size-dropdown"
                                               :items="pageSizeOptions"
                                               @select="changePageSize"
                            >
                                {{ proxyState.pageSize }}
                            </p-select-dropdown>
                        </div>
                    </slot>
                    <div v-if="excelVisible"
                         class="tool"
                    >
                        <p-icon-button
                            name="ic_excel"
                            @click="$emit('clickExcel',$event)"
                        />
                    </div>
                    <div v-if="refreshVisible"
                         class="tool"
                    >
                        <p-icon-button
                            name="ic_refresh"
                            @click="$emit('clickRefresh', $event)"
                        />
                    </div>
                </div>
            </div>
            <div class="toolbox-bottom">
                <slot name="toolbox-bottom" />
            </div>
        </div>
        <transition-group name="fade-in"
                          tag="div"
                          class="transition-group"
        >
            <div v-if="!items || items.length === 0"
                 key="no-data"
                 class="transition-item"
            >
                <slot name="no-data" />
            </div>
            <div v-else
                 key="grid-layout"
                 class="transition-item"
            >
                <p-grid-layout v-bind="$props"
                               v-on="$listeners"
                >
                    <template v-for="(_, slot) of $scopedSlots"
                              #[slot]="scope"
                    >
                        <slot :name="slot"
                              v-bind="scope"
                        />
                    </template>
                </p-grid-layout>
            </div>
            <div v-if="loading"
                 key="loading"
                 class="loading"
            >
                <div class="loading-backdrop fade-in" />
                <div class="loader">
                    <slot name="loading">
                        <p-lottie name="thin-spinner"
                                  :size="2.5"
                                  auto
                                  class="loading-spinner"
                        />
                    </slot>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { flatMap } from 'lodash';

import PLottie from '@/foundation/lottie/PLottie.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PTextPagination from '@/navigation/pagination/text-pagination/PTextPagination.vue';
import PGridLayout from '@/others/deprecated/grid-layout/PGridLayout.vue';
import type { ToolboxGridLayoutProps } from '@/others/deprecated/toolbox-grid-layout/type';
import { makeOptionalProxy } from '@/utils/composition-helpers';

export default {
    name: 'PToolboxGridLayout',
    components: {
        PSelectDropdown,
        PLottie,
        PGridLayout,
        PTextPagination,
        PIconButton,
    },
    events: ['pageChange', 'select', 'clickRefresh'],
    props: {
        cardMinWidth: {
            type: String,
            default: '12rem',
        },
        cardMaxWidth: {
            type: String,
            default: '1fr',
        },
        cardHeight: {
            type: String,
            default: '20rem',
        },
        rowGap: {
            type: String,
            default: '1rem',
        },
        fixColumn: {
            type: Number,
            default: null,
        },
        columnGap: {
            type: String,
            default: '1rem',
        },
        cardClass: {
            type: Function,
            default: () => ['card-item'],
        },
        cardStyle: {
            type: Function,
            default: () => ({}),
        },
        items: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        selectItem: {
            type: String,
            default: '',
        },
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
            type: Boolean,
            default: true,
        },
        excelVisible: {
            type: Boolean,
            default: false,
        },
        refreshVisible: {
            type: Boolean,
            default: true,
        },
        thisPage: {
            type: Number,
            validator(value) {
                return undefined || value > 0;
            },
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        paginationValues: {
            type: Array,
            default: () => [24, 36, 48],
        },
        allPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
            default: 1,
        },
    },
    setup(props: ToolboxGridLayoutProps, context) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const proxyState = reactive({
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, 24),
        });

        const state = reactive({
            pageSizeOptions: computed(() => (flatMap(props.paginationValues, (size) => ({ type: 'item', label: size, name: size })))),
        });
        const changePageNumber = (page) => {
            proxyState.thisPage = page;
            context.emit('changePageNumber', page);
        };
        const changePageSize = (size) => {
            const sizeNum = Number(size);
            if (proxyState.pageSize !== sizeNum) {
                proxyState.pageSize = sizeNum;
                proxyState.thisPage = 1;
                context.emit('changePageSize', sizeNum);
            }
        };
        return {
            proxyState,
            ...toRefs(state),
            changePageSize,
            changePageNumber,
        };
    },

};
</script>

<style lang="postcss">
.p-toolbox-grid-layout {
    $min-height: 16.875rem;
    overflow: hidden;

    @apply relative flex flex-col w-full h-full;
    min-height: $min-height;

    .transition-group {
        @apply relative h-full w-full;
    }
    .transition-item {
        @apply w-full h-full;
    }
    .fade-in-leave-active, .fade-in-enter-active {
        @apply absolute;
        transition: opacity 0.25s;
    }

    .toolbox {
        @apply w-full;
    }

    .toolbox-middle {
        @apply flex items-center mb-6;
        .left {
            @apply flex-grow flex-shrink-0 inline-flex justify-start;
        }
        .right {
            @apply flex-shrink-0 inline-flex justify-end;
            .page-size-dropdown::v-deep {
                .p-dropdown-btn {
                    min-width: 6rem;
                }
            }
            .tool {
                @apply ml-4;
            }
        }
    }

    .loading {
        @apply absolute w-full h-full overflow-hidden;
        top: 0;
        .loading-backdrop {
            @apply w-full h-full;
            background-color: white;
            opacity: 0.5;
            z-index: 100;
        }
        .loader {
            @apply absolute w-full h-full;
            top: 0;
            z-index: 101;
        }
        .loading-spinner {
            @apply flex justify-center items-center w-full;
            height: $min-height;
        }
    }

    /* transitions */
    .fade-in-enter-active {
        transition: opacity 0.2s;
    }
    .fade-in-leave-active {
        transition: opacity 0.2s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-leave, .fade-in-enter-to {
        opacity: 0.5;
    }
}
</style>

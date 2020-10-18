<template>
    <div class="grid-list-container">
        <div class="toolbox">
            <div class="toolbox-top">
                <slot name="toolbox-top" />
            </div>
            <div class="toolbox-middle">
                <div class="left" :style="{width: '100%'}">
                    <slot name="toolbox-left" />
                </div>
                <div v-if="$slots['toolbox-center']" class="center">
                    <slot name="toolbox-center" />
                </div>
                <div class="right">
                    <slot name="toolbox-right" />
                    <div v-if="paginationVisible" class="tool">
                        <p-text-pagination
                            :this-page.sync="proxyState.thisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <slot v-if="pageSizeVisible" name="page-size">
                        <div class="tool">
                            <p-dropdown-menu-btn
                                class="page-size-dropdown"
                                :menu="pageSizeOptions"
                                @select="changePageSize"
                            >
                                {{ proxyState.pageSize }}
                            </p-dropdown-menu-btn>
                        </div>
                    </slot>
                    <div v-if="excelVisible" class="tool">
                        <p-icon-button
                            name="ic_excel"
                            @click="$emit('clickExcel',$event)"
                        />
                    </div>
                    <div v-if="refreshVisible" class="tool">
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
        <slot v-if="loading" name="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading-spinner"
            />
        </slot>
        <transition-group name="fade-in" tag="div" class="transition-group">
            <!--            <div v-if="loading" key="loading" class="transition-item">-->
            <!--                <slot name="loading" />-->
            <!--            </div>-->
            <div v-if="!items || items.length === 0" key="no-data" class="transition-item">
                <slot name="no-data" />
            </div>
            <div v-else key="grid-layout" class="transition-item">
                <p-grid-layout v-bind="$props" v-on="$listeners">
                    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope" />
                    </template>
                </p-grid-layout>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import { flatMap } from 'lodash';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PTextPagination from '@/components/organisms/pagination/PTextPagination.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy, makeProxy } from '@/components/util/composition-helpers';
import { gridLayoutProps } from '@/components/molecules/layouts/grid-layout/PGridLayout.toolset';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

export default {
    name: 'PToolboxGridLayout',
    components: {
        PLottie,
        PGridLayout,
        PTextPagination,
        PIconButton,
        PDropdownMenuBtn,
    },
    events: ['pageChange', 'select', 'clickRefresh'],
    props: {
        ...gridLayoutProps,
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
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const localState = reactive({
            thisPage: props.thisPage === undefined ? 1 : props.thisPage,
            pageSize: props.pageSize === undefined ? 24 : props.pageSize,
        });

        const proxyState = reactive({
            thisPage: makeOptionalProxy<number>('thisPage', vm, localState),
            pageSize: makeOptionalProxy<number>('pageSize', vm, localState),
        });

        const state = reactive({
            pageSizeOptions: computed(() => (flatMap(props.paginationValues, size => ({ type: 'item', label: size, name: size })))),
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

<style lang="postcss" scoped>
    .grid-list-container {
        @apply flex flex-col w-full h-full;
    }
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
    .fade-in-leave-to, .fade-in-enter {
        opacity: 0;
    }
    .fade-in-enter-to, .fade-in-leave {
        opacity: 1;
    }

    /* .toolbox { */

    /*    margin-top: 0.5rem; */
        .toolbox-middle {
            @apply flex flex-no-wrap justify-between items-center mb-6;
            .left {
                @apply inline-flex flex-wrap w-auto justify-start;
            }
            .right {
                @apply inline-flex flex-no-wrap w-auto justify-end;
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

    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: white;
        opacity: 0.5;
        top: 0;
        z-index: 1;
    }
    .loading-spinner {
        @apply absolute flex justify-center items-center;
        z-index: 1;
        width: 80%;
        height: 50%;
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

</style>

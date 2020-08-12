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
                            :this-page.sync="proxyThisPage"
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
                                {{ proxyPageSize }}
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
        <transition-group name="fade-in" tag="div" class="transition-group">
            <div v-if="loading" key="loading" class="transition-item">
                <slot name="loading" />
            </div>
            <div v-else-if="items.length === 0" key="no-data" class="transition-item">
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
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy, makeProxy } from '@/components/util/composition-helpers';
import { gridLayoutProps } from '@/components/molecules/layouts/grid-layout/PGridLayout.toolset';
import { ComponentInstance } from '@vue/composition-api/dist/component';

export default {
    name: 'PToolboxGridLayout',
    components: {
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
                return value > 0;
            },
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 24,
        },
        pageNationValues: {
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
        const vm = getCurrentInstance() as ComponentInstance;

        const state = reactive({
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
            pageSizeOptions: computed(() => (flatMap(props.pageNationValues, size => ({ type: 'item', label: size, name: size })))),
        });
        const changePageNumber = (page) => {
            state.proxyThisPage = page;
            context.emit('changePageNumber', page);
        };
        const changePageSize = (size) => {
            const sizeNum = Number(size);
            if (props.pageSize !== sizeNum) {
                state.proxyPageSize = sizeNum;
                state.proxyThisPage = 1;
                context.emit('changePageSize', sizeNum);
            }
        };
        return {
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

</style>

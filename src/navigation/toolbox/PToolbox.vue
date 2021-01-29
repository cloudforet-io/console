<template>
    <div class="p-toolbox">
        <div class="toolbox-wrapper">
            <div v-if="paginationVisible" class="tool">
                <p-text-pagination :this-page="thisPage"
                                   :all-page="allPage"
                                   @pageChange="onChangeThisPage"
                />
            </div>
            <div v-if="pageSizeChangeable" class="tool">
                <p-dropdown-menu-btn class="dropdown-list"
                                     :menu="pageMenu"
                                     @select="onChangePageSize"
                >
                    {{ proxyState.pageSize }}
                </p-dropdown-menu-btn>
            </div>
            <div v-if="sortable" class="tool">
                <p-dropdown-menu-btn class="dropdown-list"
                                     :menu="sortByMenu"
                                     @select="onChangeSortBy"
                >
                    {{ proxyState.sortBy }}
                </p-dropdown-menu-btn>
            </div>
            <div v-if="exportable" class="tool">
                <p-icon-button name="ic_excel"
                               @click="$emit('export',$event)"
                />
            </div>
            <div v-if="refreshable" class="tool">
                <p-icon-button name="ic_refresh"
                               @click="$emit('refresh', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import PIconButton from '@/molecules/buttons/icon-button/PIconButton.vue';
import PDropdownMenuBtn from '@/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTextPagination from '@/organisms/paginations/text-pagination/PTextPagination.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy } from '@/util/composition-helpers';

interface Options {
    start?: number;
    limit?: number;
    sortBy?: string;
}

export default {
    name: 'PToolbox',
    components: { PTextPagination, PDropdownMenuBtn, PIconButton },
    props: {
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeChangeable: {
            type: Boolean,
            default: true,
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        exportable: {
            type: Boolean,
            default: false,
        },
        refreshable: {
            type: Boolean,
            default: true,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        sortBy: {
            type: String,
            default: '',
        },
        pageSizeOptions: {
            type: Array,
            default: () => [24, 36, 48],
        },
        sortByOptions: {
            type: Array,
            default: () => [],
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const proxyState = reactive({
            pageSize: makeOptionalProxy<number>('pageSize', vm, props.pageSizeOptions[0] || 24),
            sortBy: makeOptionalProxy<number>('sortBy', vm, props.sortByOptions[0] || 24),
        });

        const state = reactive({
            thisPage: 1,
            pageStart: computed(() => ((state.thisPage - 1) * proxyState.pageSize) + 1),
            allPage: computed(() => Math.ceil(props.totalCount / proxyState.pageSize) || 1),
            pageMenu: computed(() => {
                if (!Array.isArray(props.pageSizeOptions)) return [];
                return props.pageSizeOptions.map(d => ({
                    name: d, label: d, type: 'item',
                }));
            }),
            sortByMenu: computed(() => {
                if (!Array.isArray(props.sortByOptions)) return [];
                return props.sortByOptions.map(d => ({
                    name: d, label: d, type: 'item',
                }));
            }),
        });


        const emitChange = (options) => {
            vm.$emit('change', options);
        };

        const onChangeThisPage = (thisPage: number) => {
            state.thisPage = thisPage;
            emitChange({ start: state.pageStart });
        };

        const onChangePageSize = (pageSize) => {
            proxyState.pageSize = pageSize;
            emitChange({ limit: pageSize });
        };

        const onChangeSortBy = (sortBy) => {
            proxyState.sortBy = sortBy;
            emitChange({ sortBy });
        };

        return {
            proxyState,
            ...toRefs(state),
            onChangeThisPage,
            onChangePageSize,
            onChangeSortBy,
        };
    },
};
</script>

<style lang="postcss">
.p-toolbox {
    @apply w-full;
    .toolbox-wrapper {
        @apply inline-flex justify-end;
        .dropdown-list {
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

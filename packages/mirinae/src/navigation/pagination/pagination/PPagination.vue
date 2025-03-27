<template>
    <nav :class="{'pagination': true, [size]: true}">
        <p-icon-button class="text"
                       :size="size"
                       name="ic_chevron-left"
                       color="inherit transparent"
                       :disabled="proxyState.thisPage === 1"
                       @click="prevPage"
        />
        <div class="page-number-wrapper">
            <div class="page-number-list">
                <span v-for="page in pageList.pages"
                      :key="page"
                      @click="clickPage(page)"
                >
                    <span :class="{
                        'page-number': true,
                        selected: page === proxyState.thisPage
                    }"
                    > {{ page }} </span>
                </span>
            </div>
        </div>
        <p-icon-button class="text"
                       :size="size"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       :disabled="proxyState.thisPage === pageList.totalPages"
                       @click="nextPage"
        />
    </nav>
</template>
<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent,
    computed, reactive,
} from 'vue';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import { useProxyValue } from '@/hooks';
import type { PaginationSize } from '@/navigation/pagination/pagination/type';
import { PAGINATION_SIZE } from '@/navigation/pagination/pagination/type';

export default defineComponent({
    name: 'PPagination',
    components: { PIconButton },
    props: {
        thisPage: {
            type: Number,
            validator(value: number) {
                return value > 0;
            },
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        totalCount: {
            type: Number,
            required: true,
        },
        size: {
            type: String as PropType<PaginationSize>,
            default: PAGINATION_SIZE.md,
        },
    },
    setup(props, { emit }) {
        // pagination logic
        const paginate = (
            totalItems,
            currentPage,
            pageSize,
            maxPages,
        ) => {
            // calculate total pages
            const totalPages = Math.ceil(totalItems / pageSize);

            // ensure current page isn't out of range
            if (currentPage < 1) {
                // eslint-disable-next-line no-param-reassign
                currentPage = 1;
            } else if (currentPage > totalPages) {
                // eslint-disable-next-line no-param-reassign
                currentPage = totalPages;
            }

            let startPage: number; let endPage: number;
            if (totalPages <= maxPages) {
                // total pages less than max so show all pages
                startPage = 1;
                endPage = totalPages > startPage ? totalPages : startPage;
            } else {
                // total pages more than max so calculate start and end pages
                const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
                const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
                if (currentPage <= maxPagesBeforeCurrentPage) {
                    // current page near the start
                    startPage = 1;
                    endPage = maxPages;
                } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                    // current page near the end
                    startPage = totalPages - maxPages + 1;
                    endPage = totalPages;
                } else {
                    // current page somewhere in the middle
                    startPage = currentPage - maxPagesBeforeCurrentPage;
                    endPage = currentPage + maxPagesAfterCurrentPage;
                }
            }

            // calculate start and end item indexes
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control
            const pages = Array.from(Array((endPage + 1) - startPage).keys()).map((i) => startPage + i);

            // return object with all pager properties required by the view
            return {
                totalItems,
                currentPage,
                pageSize,
                totalPages,
                startPage,
                endPage,
                startIndex,
                endIndex,
                pages,
            };
        };
        const pageList = computed(() => paginate(props.totalCount, props.thisPage, props.pageSize, 10));

        const proxyState = reactive({
            thisPage: useProxyValue<number>('thisPage', props, emit),
            pageSize: useProxyValue<number>('pageSize', props, emit),
        });

        const clickPage = (page) => {
            proxyState.thisPage = page;
            emit('click-page', page);
            emit('change', page);
        };

        const prevPage = () => {
            let page = proxyState.thisPage - 1;
            if (page <= 0) page = 1;
            proxyState.thisPage = page;
            emit('click-prev', page);
            emit('change', page);
        };

        const nextPage = () => {
            const page = proxyState.thisPage + 1;
            proxyState.thisPage = page;
            emit('click-next', page);
            emit('change', page);
        };

        return {
            paginate,
            pageList,
            proxyState,
            clickPage,
            // updatePage,
            prevPage,
            nextPage,
        };
    },
});
</script>

<style lang="postcss" scoped>
.pagination {
    @apply min-w-12;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    @apply lg:min-w-16;

    .page-number-wrapper {
        @apply min-h-8 min-w-12 items-center justify-center inline-flex cursor-pointer;
        .page-number-list {
            @apply flex items-center text-label-md;
            padding-left: 1.5rem;
            .page-number {
                @apply text-gray-500;
                padding-right: 1.5rem;

                &:hover {
                    @apply text-blue-600;
                }

                &.selected {
                    @apply font-bold text-gray-900;
                }
            }
        }

        @apply lg:min-w-16;
    }
    &.sm {
        .page-number-wrapper {
            .page-number-list {
                @apply text-label-sm;
                min-height: 1.5rem;
                min-width: 2.25rem;
                padding-left: 0.75rem;
                .page-number {
                    padding-right: 0.75rem;
                }
            }
        }
    }
}

</style>

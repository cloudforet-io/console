<template>
    <nav class="pagination">
        <p-icon-button class="text"
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
                    <span v-if="page === proxyState.thisPage"
                          class="page-number"
                    ><b>{{ proxyState.thisPage }}</b></span>
                    <span v-else
                          class="page-number"
                    > {{ page }} </span>
                </span>
            </div>
        </div>
        <p-icon-button class="text"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       :disabled="proxyState.thisPage === pageList.totalPages"
                       @click="nextPage"
        />
    </nav>
</template>
<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { useProxyValue } from '@/hooks';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

const props = defineProps({
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
});
const emit = defineEmits(['update:this-page', 'update:page-size', 'change', 'click-page', 'click-prev', 'click-next']);

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

</script>

<style lang="postcss" scoped>
.pagination {
    @apply min-w-12;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    @screen lg {
        @apply min-w-16;
    }
}
.page-number-wrapper {
    @apply min-h-8 min-w-12 items-center justify-center inline-flex cursor-pointer;
    .page-number-list {
        line-height: 1.2rem;
        font-size: 0.875rem;
        padding-left: 1.5rem;
        .page-number {
            padding-right: 1.5rem;
        }
    }

    @screen lg {
        @apply min-w-16;
    }
}

</style>

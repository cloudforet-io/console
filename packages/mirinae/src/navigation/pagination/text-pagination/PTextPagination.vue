<template>
    <nav class="text-pagination">
        <p-icon-button class="text"
                       name="ic_chevron-left"
                       color="inherit transparent"
                       :disabled="thisPage === 1"
                       @click="update(thisPage - 1)"
        />
        <div v-if="showPageNumber"
             class="page-number"
        >
            <div class="page-number-text">
                <slot>
                    <span class="this-page">{{ thisPage }}</span>
                    <span v-if="allPage"> / {{ allPage }}</span>
                </slot>
            </div>
        </div>

        <p-icon-button class="text"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       :disabled="thisPage === allPage || disableNextPage"
                       @click="update(thisPage + 1)"
        />
    </nav>
</template>
<script setup lang="ts">
import { watch } from 'vue';

import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

interface Props {
    thisPage: number;
    allPage: number;
    showPageNumber?: boolean;
    disableNextPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showPageNumber: true,
    disableNextPage: false,
});
const emit = defineEmits(['update:this-page', 'page-change']);

const update = (page: number) => {
    emit('update:this-page', page);
    emit('page-change', page);
};
watch([() => props.allPage, () => props.thisPage], ([allPage, thisPage]) => {
    if (!allPage || !thisPage) return;
    if (thisPage > allPage) {
        update(allPage);
    }
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.text-pagination {
    @apply min-w-12;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    @screen lg {
        @apply min-w-16;
    }
}
.page-number {
    @apply min-h-8 min-w-12 items-center justify-center inline-flex cursor-default;
    .page-number-text {
        line-height: 1.2rem;
        font-size: 0.875rem;
        .this-page {
            font-weight: bold;
        }
    }

    @screen lg {
        @apply min-w-16;
    }
}

</style>

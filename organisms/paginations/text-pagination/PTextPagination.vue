<template>
    <nav class="text-pagination">
        <p-icon-button class="text"
                       name="ic_arrow_left"
                       color="inherit transparent"
                       :disabled="thisPage === 1"
                       @click="update(thisPage-1)"
        />
        <div class="page-number">
            <div class="page-number-text">
                <span class="this-page">{{ thisPage }}</span> / <span>{{ allPage }}</span>
            </div>
        </div>

        <p-icon-button class="text"
                       name="ic_arrow_right"
                       color="inherit transparent"
                       :disabled="thisPage === allPage"
                       @click="update(thisPage+1)"
        />
    </nav>
</template>
<script>
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';

export default {
    name: 'PTextPagination',
    components: { PIconButton },
    setup(props, { emit }) {
        return {
            update(page) {
                emit('update:thisPage', page);
                emit('pageChange', page);
            },
            iconHoverColor: 'transparent inherit',
        };
    },
    props: {
        thisPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
        },
        allPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
        },
    },
};
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

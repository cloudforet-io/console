<template>
    <nav class="text-pagenation">
        <p-icon-button class="text"
                       name="ic_arrow_left"
                       :disabled="thisPage === 1"
                       color="transparent inherit"
                       @click="update(thisPage-1)"
        />
        <div class="page-number">
            <div class="page-number-text">
                <span class="this-page">{{ thisPage }}</span> / <span>{{ allPage }}</span>
            </div>
        </div>

        <p-icon-button class="text"
                       name="ic_arrow_right"
                       :disabled="thisPage === allPage"
                       color="transparent inherit"
                       @click="update(thisPage+1)"
        />
    </nav>
</template>
<script>
import PIconButton from '@/components/molecules/buttons/IconButton.vue';

export default {
    name: 'PTextButton',
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
    .text-pagenation {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap:nowrap;
        min-width: 64px;
        .text {
            color: inherit;
            &:hover {
                color: theme('colors.secondary1')
            }
        }
    }
    .page-number {
        display: inline-flex;
        justify-content: center;
        min-width: 64px;
        min-height: 32px;
        align-items: center;
        cursor: default;
        .page-number-text {
            line-height: 1.2rem;
            font-size: 0.875rem;
            .this-page {
                font-weight: bold;
            }
        }

    }
    .icon-button {
        &:not(:disabled):not(.disabled):hover {
            @apply bg-white;
            border-color:transparent;
        }
    }

</style>

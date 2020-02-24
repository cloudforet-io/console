<template>
    <nav class="text-pagenation">
        <p-icon-button
            name="ic_arrow_left"
            :disabled="thisPage === 1"
            :hover-color="iconHoverColor"
            @click="update(thisPage-1)"
        />
        <div class="page-number">
            <div class="page-number-text">
                <span class="this-page">{{ thisPage }}</span> / <span>{{ allPage }}</span>
            </div>
        </div>

        <p-icon-button
            name="ic_arrow_right"
            :disabled="thisPage === allPage"
            :hover-color="iconHoverColor"
            @click="update(thisPage+1)"
        />
    </nav>
</template>
<script>
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import { secondary1 } from '@/styles/_variables.scss';

export default {
    name: 'PTextButton',
    components: { PIconButton },
    setup(props, { emit }) {
        return {
            update(page) {
                emit('update:thisPage', page);
                emit('pageChange', page);
            },
            iconHoverColor: `transparent ${secondary1}`,
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

<style lang="scss" scoped>
    .text-pagenation{
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap:nowrap;
        min-width: 64px;
    }
    .page-number{
        display: inline-flex;
        justify-content: center;
        min-width: 64px;
        min-height: 32px;
        align-items: center;
        cursor: default;
        .page-number-text{
            line-height: 1.2rem;
            .this-page{
                font-weight: bold;
            }
        }

    }
    .icon-button{
        &:not(:disabled):not(.disabled):hover{
            background-color: $white;
            border-color:transparent ;
        }
    }

</style>

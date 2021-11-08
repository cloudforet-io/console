<template>
    <div class="cost-type-balloon" :style="balloonStyle">
        <section class="header">
            <span class="header-title">Cost Type</span>
            <span class="self-center">{{ costTypeKey }}</span>
            <p-icon-button name="ic_delete"
                           class="close-button"
                           height="1.5em"
                           @click="handleClose"
            />
        </section>
        <hr class="divider">
        <section class="content">
            <span v-for="item in costTypeValue" :key="`${item}-index`">
                {{ item }}
            </span>
        </section>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { PIconButton } from '@spaceone/design-system';

interface Props {
    balloonWidth: number;
    balloonVisible: boolean;
    costTypeKey: string;
    costTypeValue: string[];
}

const BalloonTailWidth = 12;
const BalloonMargin = 4;

export default {
    name: 'BudgetCostTypeBalloon',
    components: {
        PIconButton,
    },
    props: {
        balloonWidth: {
            type: Number,
            default: 0,
        },
        balloonVisible: {
            type: Boolean,
            default: false,
        },
        costTypeKey: {
            type: String,
            default: '',
        },
        costTypeValue: {
            type: Array,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            balloonStyle: computed(() => ({
                right: `${props.balloonWidth + BalloonTailWidth + BalloonMargin}px`,
            })),
            proxyVisible: makeProxy('balloonVisible', props, emit),
        });
        const handleClose = () => {
            state.proxyVisible = false;
        };
        return {
            ...toRefs(state),
            handleClose,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-type-balloon {
    @apply rounded-sm border border-gray-200 bg-white;
    position: absolute;
    top: -3rem;
    width: 18rem;
    height: 12.18rem;
    padding: 1rem;
    z-index: 1;
}

.cost-type-balloon::before {
    content: "";
    position: absolute;
    left: calc(100% + 1px);
    top: 23%;
    width: 0;
    height: 0;
    border-top: 0.75rem solid transparent;
    border-left: 13px solid theme('colors.gray.200');
    border-bottom: 0.75rem solid transparent;
}

.cost-type-balloon::after {
    content: "";
    position: absolute;
    left: 100%;
    top: 23%;
    width: 0;
    height: 0;
    border-top: 0.75rem solid transparent;
    border-left: 0.75rem solid theme('colors.white');
    border-bottom: 0.75rem solid transparent;
}

.header {
    @apply flex;
    font-size: 1rem;
    line-height: 100%;
    .header-title {
        @apply font-bold text-gray-500;
        margin-right: 0.5rem;
        align-self: center;
    }
    .close-button {
        margin-left: auto;
    }
}
.divider {
    @apply w-full border border-gray-200;
    margin-top: 0.75rem;
    margin-bottom: 1rem;
}

</style>

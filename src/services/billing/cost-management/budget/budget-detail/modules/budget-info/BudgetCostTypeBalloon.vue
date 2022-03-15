<template>
    <div class="cost-type-balloon" :style="balloonStyle">
        <section class="header">
            <span class="header-title">Cost Type</span>
            <span class="self-center">{{ costTypeMap[costTypeKey] }}</span>
            <p-icon-button name="ic_delete"
                           class="close-button"
                           height="1.5em"
                           @click="handleClose"
            />
        </section>
        <hr class="divider">
        <section class="content">
            {{ costTypeValue }}
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
    costTypeValue: string;
}

const BalloonTailWidth = 12;
const BalloonMargin = 4;

const costTypeMap = {
    region_code: 'Region',
    service_account_id: 'Service Account',
    provider: 'Provider',
    product: 'Product',
};

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
            type: String,
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
            costTypeMap,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-type-balloon {
    @apply rounded-xs border border-gray-200 bg-white;
    position: absolute;
    top: -3rem;
    width: 18rem;
    height: 12.18rem;
    padding: 1rem;
    z-index: 1;
}

.cost-type-balloon::before,
.cost-type-balloon::after {
    content: "";
    position: absolute;
    top: calc(23% - 0.0625rem);
    left: calc(100% + 0.0625rem);
    width: 0;
    height: 0;
    border-width: 0.8125rem 0 0.8125rem 0.8125rem;
    border-style: solid;
    border-color: transparent transparent transparent theme('colors.gray.200');
}

.cost-type-balloon::after {
    top: 23%;
    left: 100%;
    border-width: 0.75rem 0 0.75rem 0.75rem;
    border-color: transparent transparent transparent theme('colors.white');
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

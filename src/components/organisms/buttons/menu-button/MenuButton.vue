<template>
    <div>
        <p-tooltip
            :contents="tooltip"
            position="right"
        >
            <template #target>
                <p-button
                    class="menu-btn"
                    shape="circle"
                    size="lg"
                    v-on="$listeners"
                >
                    <template>
                        <slot>
                            <f-i :icon="icon" />
                        </slot>
                    </template>
                </p-button>
            </template>
        </p-tooltip>
    </div>
</template>

<script>
import Tooltip from '@/components/molecules/tooltips/Tooltip.vue';
import Button from '@/components/atoms/buttons/Button.vue';
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'MenuButton',
    events: ['click'],
    components: {
        PTooltip: Tooltip,
        PButton: Button,
        FI,
    },
    props: {
        icon: {
            type: String,
            default: null,
        },
        tooltip: {
            type: String,
            default: null,
        },
    },
};
</script>

<style scoped lang="scss">
    .menu-btn {
    }
</style>

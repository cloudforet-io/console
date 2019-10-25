<template>
    <div class="circle-button">
        <p-button shape="circle">
            <template>
                <slot name="contents">
                    <f-i :icon="icon"/>
                </slot>
            </template>
        </p-button>
        <p-tooltip :contents="tooltip" />
    </div>
</template>

<script>
import Tooltip from '@/components/molecules/tooltips/Tooltip.vue';
import Button from '@/components/atoms/buttons/Button.vue';
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'MenuButton',
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

</style>

<template>
    <span>
        <f-i
            :icon="icon"
            :iconStyle="iconStyle"
            :size="size"
            :animation="animation"
            :rotating="rotating"
            :flip="flip"
            :style="fiStyle"
        />
        <p-label
            :style="labelStyle"
        >
            {{ text }}
        </p-label>
    </span>
</template>

<script>
import FI from '@/components/atoms/icons/FI';
import PLabel from '@/components/atoms/labels/Label';

export default {
    name: 'p-status',
    components: { FI, PLabel },
    mixins: [FI],
    props: {
        text: {
            type: String,
        },
        textColor: {
            type: String,
            default: null,
        },
        iconColor: {
            type: String,
            default: null,
        },
    },
    computed: {
        labelStyle() {
            return this.textColor ? { color: this.textColor } : null;
        },
        fiStyle() {
            return this.iconColor ? { color: this.iconColor } : null;
        },

    },
};
</script>

<style scoped>

</style>

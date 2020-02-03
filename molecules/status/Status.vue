<template>
    <span class="p-status">
        <p-i v-if="icon" :name="icon" :color="iconStyle" />
        <span v-else class="circle" :style="circleStyle" />
        <p-label class="label" :style="labelStyle">
            {{ text }}
        </p-label>
    </span>
</template>

<script>
import PI from '@/components/atoms/icons/PI.vue';
import PLabel from '@/components/atoms/labels/Label.vue';

export default {
    name: 'PStatus',
    components: { PI, PLabel },
    props: {
        icon: {
            type: String,
            default: null,
        },
        text: {
            type: String,
            default: null,
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
        circleStyle() {
            return this.iconColor ? { backgroundColor: this.iconColor } : null;
        },
        iconStyle() {
            return this.iconColor ? `transparent ${this.iconColor}` : null;
        },
    },
};
</script>

<style lang="scss" scoped>
    .p-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        .circle {
            border-radius: 50%;
            height: 0.5rem;
            width: 0.5rem;
        }
        .label {
            margin: 0;
            padding-left: .5rem;
        }
    }
</style>

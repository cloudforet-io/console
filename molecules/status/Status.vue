<template>
    <span class="p-status">
        <p-i v-if="icon" :name="icon" :color="`transparent ${iconColor}`"/>
        <span v-else class="circle" :style="circleStyle" />
        <p-label class="label" :style="labelStyle">
            {{ text }}
        </p-label>
    </span>
</template>

<script>
import PI from '@/components/atoms/icons/PI';
import PLabel from '@/components/atoms/labels/Label';

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
    },
};
</script>

<style lang="scss" scoped>
    .p-status {
        display: flex;
        align-items: center;
        justify-content: center;
        .circle {
            border-radius: 50%;
            height: 8px;
            width: 8px;
        }
        .label {
            margin: 0 0 0 8px;
        }
    }
</style>

<template>
    <i :class="classObject"></i>
</template>


<script>
import { icon_style_mapping, size_mapping, animation_mapping, rotating_mapping, flip_mapping } from './FiMapping';

export default {
    name: 'f-i',
    props: {
        icon: {
            type: String,
            required: true
        },
        iconStyle: {
            type: String,
            default: 'solid',
            validator: (value) => icon_style_mapping.hasOwnProperty(value)
        },
        size: {
            type: String,
            default: null,
            validator: (value) => size_mapping.hasOwnProperty(value)
        },
        animation: {
            type: String,
            default: null,
            validator: (value) => animation_mapping.hasOwnProperty(value)
        },
        rotating: {
            type: String,
            default: null,
            validator: (value) => rotating_mapping.hasOwnProperty(value)
        },
        flip: {
            type: String,
            default: null,
            validator: (value) => flip_mapping.hasOwnProperty(value)
        }
    },
    computed: {
        classObject() {
            return [
                icon_style_mapping[this.iconStyle],
                this.icon,
                size_mapping[this.size],
                animation_mapping[this.animation],
                flip_mapping[this.flip]||rotating_mapping[this.rotating],
            ];
        }
    }
};
</script>

<style scoped>

</style>
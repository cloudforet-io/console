<template>
    <i :class="classObject"></i>
</template>


<script>
import {
    icon_style_mapping, size_mapping, animation_mapping, rotating_mapping, flip_mapping,
} from './FiMapping';

export default {
    name: 'f-i',
    props: {
        icon: {
            type: String,
            required: true,
        },
        iconStyle: {
            type: String,
            default: 'solid',
            validator: value => value in icon_style_mapping,
        },
        size: {
            type: String,
            default: null,
            validator: value => value in size_mapping,
        },
        animation: {
            type: String,
            default: null,
            validator: value => value in animation_mapping,
        },
        rotating: {
            type: String,
            default: null,
            validator: value => value in rotating_mapping,
        },
        flip: {
            type: String,
            default: null,
            validator: value => value in flip_mapping,
        },
    },
    computed: {
        classObject() {
            return [
                icon_style_mapping[this.iconStyle],
                this.icon,
                size_mapping[this.size],
                animation_mapping[this.animation],
                flip_mapping[this.flip] || rotating_mapping[this.rotating],
            ];
        },
    },
};
</script>

<style scoped>

</style>

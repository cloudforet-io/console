<template>
    <i :class="classObject" />
</template>


<script>
import {
    iconStyleMapping, sizeMapping, animationMapping, rotatingMapping, flipMapping,
} from './FiMapping';

export default {
    name: 'FI',
    props: {
        icon: {
            type: String,
            required: true,
        },
        iconStyle: {
            type: String,
            default: 'solid',
            validator: value => value in iconStyleMapping,
        },
        size: {
            type: String,
            default: null,
            validator: value => value in sizeMapping,
        },
        animation: {
            type: String,
            default: null,
            validator: value => value in animationMapping,
        },
        rotating: {
            type: String,
            default: null,
            validator: value => value in rotatingMapping,
        },
        flip: {
            type: String,
            default: null,
            validator: value => value in flipMapping,
        },
    },
    computed: {
        classObject() {
            return [
                iconStyleMapping[this.iconStyle],
                this.icon,
                sizeMapping[this.size],
                animationMapping[this.animation],
                flipMapping[this.flip] || rotatingMapping[this.rotating],
            ];
        },
    },
};
</script>

<style scoped>

</style>

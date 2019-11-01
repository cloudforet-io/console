<template>
    <p-button
        class="icon-button"
        :disabled="disabled"
        :style-type="dark? 'dark': null"
        @click="$emit('click',$event)"
    >
        <f-i
            :icon="icon"
            :icon-style="iconStyle"
            :size="size"
            :animation="animation"
            :rotating="rotating"
            :flip="flip"
        />
    </p-button>
</template>

<script>
import FI from '@/components/atoms/icons/FI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import FIMixin from '@/components/atoms/icons/FIMixin';

export default {
    name: 'PIconButton',
    components: { PButton, FI },
    mixins: [FIMixin],
    props: {
        dark: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss" scoped>
    .icon-button{
        border-radius: 2px;
        padding: 8px;
    }
    .icon-button:hover{
        background: #DCDDE2 0% 0% no-repeat padding-box;
        opacity: 1;
    }

</style>

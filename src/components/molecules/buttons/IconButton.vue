<template>
    <p-button
        class="icon-button"
        :class="classObject"
        :disabled="disabled"
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
        buttonStyle: {
            type: String,
            default: 'transparent',
            validator: value => ['white', 'transparent', 'dark'].indexOf(value) !== -1,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        classObject() {
            console.log(this.buttonStyle);
            return [this.buttonStyle];
        },
    },
};
</script>

<style lang="scss" scoped>
    .icon-button{
        border-radius: 2px;
        padding: 8px;
        min-width: 32px;
        min-height: 32px;
        vertical-align:text-top;
        &:not(:disabled):not(.disabled):hover{
            background-color: #0080FB;
            border-color: #0080FB;
            color: #FFFFFF;
            opacity: 1;
        }
        &.disabled{
            color: #A7A9B2;
        }
        &.white{
            background-color: #FFFFFF;
            border-color: #DCDDE2;
        }
        &.dark{
            background-color: #222532;
            color: #FFFFFF;
        }
        &.transparent{
            &.disabled{
                background-color: rgba(255,255,255,0);
                border-color: rgba(255,255,255,0);
            }
        }
    }

</style>

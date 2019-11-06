<template>
    <p-button
        class="icon-button"
        :class="classObject"
        :disabled="disabled"
        v-on="$listeners"
    >
        <slot>
            <p-i
                :name="name"
                :dir="dir"
                :fill="fill"
                :width="width"
                :height="height"
                :scale="scale"
                :color="color"
                :original="original"
                :title="title"
            />
        </slot>
    </p-button>
</template>

<script>
import PI from '@/components/atoms/icons/PI';
import PButton from '@/components/atoms/buttons/Button';


export default {
    name: 'PIconButton',
    components: { PButton, PI },
    mixins: [PI],
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
            return [this.buttonStyle];
        },
    },
};
</script>

<style lang="scss" scoped>
    .icon-button{
        border-radius: 2px;
        padding: 0px;
        min-width: 32px;
        max-width: 32px;
        min-height: 32px;
        max-height: 32px;
        &.disabled{
            color: $gray1;
            background-color: $gray2;
            border: 1px solid $gray2;
        }
        &.white{
            background-color: $white;
            border-color: $gray2;
        }
        &.dark{
            background-color: $dark;
            color:$white;
        }
        &:not(:disabled):not(.disabled):hover{
            background-color: $secondary;
            border-color: $secondary;
            color: $white;
        }
        &.transparent{
            &.disabled{
                background-color: rgba(255,255,255,0);
                border-color: rgba(255,255,255,0);
            }
        }
    }

</style>

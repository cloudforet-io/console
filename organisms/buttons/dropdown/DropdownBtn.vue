<template>
    <div style="display:inline-flex">
        <p-button
            :disabled="disabled"
            :class="btnClassObject"
            class="dropdown-btn menu-btn"
            @click.stop="onClick"
            @mouseover="onMouseOver"
            @mouseout="onMouseOut"
        >
            <slot />
        </p-button>
        <p-icon-button class="dropdown-btn dropdown-toggle-split"
                       :class="btnClassObject"
                       :name="popup ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                       :disabled="disabled"
                       :color="`transparent ${ disabled ? '#A7A9B2' : popup||mouseover ?'#0080FB' : '#222532'}`"
                       button-style="white"
                       @click.stop="onClick"
                       @mouseover="onMouseOver"
                       @mouseout="onMouseOut"
        />
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button';
import PIconButton from '@/components/molecules/buttons/IconButton';

export default {
    name: 'PDropdownBtn',
    components: { PButton, PIconButton },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        popup: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mouseover: false,
        };
    },
    computed: {
        btnClassObject() {
            return {
                'dropdown-opened': this.popup,
                'dropdown-mouseover': this.mouseover,
            };
        },
    },
    methods: {
        onClick(event) {
            this.$emit('click', event);
            this.$emit('update:popup', !this.popup);
        },
        onMouseOver() {
            if (!this.disabled) {
                this.mouseover = true;
            }
        },
        onMouseOut() {
            if (!this.disabled) {
                this.mouseover = false;
            }
        },
    },

};
</script>

<style lang="scss" scoped>

.dropdown-btn{
    background-color: $white;
    border-bottom-width: 1px;
    border-style: solid;
    border-color: $gray2;
    min-width: 2rem;
    &.disabled{
        border-color: $gray2;
        background-color: $gray2;
        color: $gray1;
    }
    &:not(:disabled):not(.disabled):hover{
        background-color: $white;
        border-color: $secondary;
        color: $secondary;
    }
}
.dropdown-toggle-split{
    min-width:2rem;
    max-width:2rem;
    border-radius: 0px 2px 2px 0px;
}
.menu-btn{
    min-width: 6.5rem;
    width: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 2px 0px 0px 2px;
    text-align: left;
    margin-right: -4px;
    color: $dark;
}

.dropdown-mouseover, .dropdown-opened{
    border-color: $secondary !important;
    color: $secondary !important;
}


</style>

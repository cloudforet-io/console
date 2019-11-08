<template>
    <div class="dropdown">
        <p-button
            :disabled="disabled"
            :size="size"
            :class="btnClassObject"
            class="dropdown-btn menu-btn"
            @click="onClick"
            @mouseover="onMouseOver"
            @mouseout="onMouseOut"
        >
            <slot />
        </p-button>
        <p-icon-button class="dropdown-btn dropdown-toggle-split"
                       :class="btnClassObject"
                       :name="popup ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                       :disabled="disabled"
                       :size="size"
                       :color="`transparent ${ disabled ? '#A7A9B2' : popup||mouseover ?'#0080FB' : '#222532'}`"
                       button-style="white"
                       @click="onClick"
                       @mouseover="onMouseOver"
                       @mouseout="onMouseOut"
        />
        <div v-if="popup" class="dropdown-menu" style="display: block;">
            <template v-for="(item, index) in menu">
                <a v-if="item.type==='item'" :key="index" class="dropdown-item"
                   :disabled="item.disabled" @click="menuClick(item.event,$event)"
                >
                    {{ item.text }}
                </a>
                <div v-else-if="item.type==='divider'" :key="index" class="dropdown-divider" />
                <h6 v-else-if="item.type==='header'" :key="index" class="dropdown-content">
                    {{ item.text }}
                </h6>
                <p v-else-if="item.type==='text'" :key="index" class="dropdown-content">
                    {{ item.text }}
                </p>
            </template>
        </div>
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button';
import PIconButton from '@/components/molecules/buttons/IconButton';

export default {
    name: 'PDropdown',
    components: { PButton, PIconButton },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        /** @type {boolean} */
        outline: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        styleType: {
            type: String,
            default: 'primary',
            validator(value) {
                return [
                    null,
                    'primary',
                    'secondary',
                    'success',
                    'danger',
                    'warning',
                    'info',
                    'light',
                    'dark',
                ].indexOf(value) !== -1;
            },
        },
        /** @type {boolean} */
        block: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        size: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'sm',
                    'lg',
                ].indexOf(value) !== -1;
            },
        },
        menu: {
            type: Array,
        },
    },
    data() {
        return {
            popup: false,
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
        menuClick(eventName, event) {
            this.$emit(`click-${eventName}`, event);
            this.popup = false;
        },
        onClick() {
            this.popup = !this.popup;
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
.dropdown-menu{
    background-color: $secondary2;
    border: 1px solid $secondary;
    padding: 0px;
    border-radius: 2px;
    margin: 0px;
    min-width: 8.5rem;
}
.dropdown-item{
    padding-left: 14px;
    padding-bottom: 0px;
    padding-top: 0px;
    color: $secondary !important;
    font: 14px/32px Arial;
    border-bottom: 1px solid $secondary;
    &:hover {
        background-color: $secondary;
        color: $white !important;
    }
    &:last-child{
        border-bottom-width: 0px;
    }
}


</style>

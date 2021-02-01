<template>
    <div v-click-outside="outsideClick"
         class="p-dropdown-menu-btn"
    >
        <p-dropdown-btn :popup.sync="popup"
                        :block="block"
                        :disabled="disabled"
                        :button-only="buttonOnly"
                        :button-icon="buttonIcon"
                        :button-style-type="buttonStyleType"
                        @click="$emit('openMenu')"
        >
            <template v-for="(_, slot) of buttonSlots" v-slot:[slot]="scope">
                <slot :name="`button-${slot}`" v-bind="scope" />
            </template>
            <template #default>
                <slot />
            </template>
        </p-dropdown-btn>
        <p-context-menu v-if="popup"
                        class="menu-ctx"
                        :class="{block}"
                        :menu="menu"
                        :loading="loading"
                        :auto-height="autoHeight"
                        @select="clickMenuEvent"
        >
            <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';
import { computed, defineComponent, ref } from '@vue/composition-api';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import PDropdownBtn from '@/inputs/dropdown/dropdown-btn/PDropdownBtn.vue';
import { reduce } from 'lodash';
import { BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';

export default defineComponent({
    name: 'PDropdownMenuBtn',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: { PDropdownBtn, PContextMenu },
    props: {
        menu: {
            type: [Array, Object],
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        autoHeight: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        buttonOnly: {
            type: Boolean,
            default: false,
        },
        buttonIcon: {
            type: String,
            default: undefined,
        },
        buttonStyleType: {
            type: String,
            default: undefined,
            validator: (value) => {
                if (value === undefined) return true;
                return Object.keys(BUTTON_STYLE_TYPE).includes(value as any);
            },
        },
    },
    setup(props, { emit, slots }) {
        const popup = ref(false);
        const outsideClick = (): void => { popup.value = false; };
        const clickMenuEvent = (menuName: string, idx: number) => {
            emit('select', menuName, idx);
            emit(`${menuName}:select`, menuName, idx);
            emit(`click-${menuName}`, idx);
            popup.value = false;
        };

        const buttonSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('button-') || name === 'button-default') { res[`${name.substring(7)}`] = d; }
            return res;
        }, {}));

        const menuSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
            return res;
        }, {}));

        return {
            popup,
            outsideClick,
            clickMenuEvent,
            buttonSlots,
            menuSlots,
        };
    },
});
</script>

<style lang="postcss">
.p-dropdown-menu-btn {
    position: relative;
    .menu-ctx.block {
        width: 100%;
    }
}
</style>

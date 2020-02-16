<template>
    <div v-click-outside="outsideClick"
         class="p-dropdown-menu-btn"
    >
        <PDropdownBtn :popup.sync="popup"
                      :block="block"
                      :disabled="disabled"
                      @click="$emit('openMenu')"
        >
            <slot />
        </PDropdownBtn>
        <PContextMenu v-if="popup"
                      class="menu-ctx"
                      :class="{block}"
                      :menu="menu"
                      :loading="loading"
                      :auto-height="autoHeight"
                      @clickMenuEvent="clickMenuEvent"
        />
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';
import { createComponent, ref } from '@vue/composition-api';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import PDropdownBtn from '@/components/organisms/dropdown/dropdown-btn/DropdownBtn.vue';

export default createComponent({
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
        block: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        autoHeight: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const popup = ref(false);
        const outsideClick = ():void => { popup.value = false; };
        const clickMenuEvent = (eventName:string, idx:number) => {
            emit('clickMenuEvent', eventName, idx);
            emit(`click-${eventName}`, idx);
            popup.value = false;
        };

        return {
            popup,
            outsideClick,
            clickMenuEvent,
        };
    },
});
</script>
<style lang="scss" scoped>
    .p-dropdown-menu-btn{
        position: relative;
    }
    .menu-ctx.block {
        width: 100%;
    }
</style>

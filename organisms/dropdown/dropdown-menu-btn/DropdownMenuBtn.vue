<template>
    <div v-click-outside="outsideClick"
         class="p-dropdown-menu-btn"
    >
        <p-dropdown-btn :popup.sync="popup"
                        :block="block"
                        :disabled="disabled"
                        @click="$emit('openMenu')"
        >
            <slot />
        </p-dropdown-btn>
        <p-context-menu v-if="popup"
                        class="menu-ctx"
                        :class="{block}"
                        :menu="menu"
                        :loading="loading"
                        :auto-height="autoHeight"
                        @select="clickMenuEvent"
        />
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';
import { ref } from '@vue/composition-api';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import PDropdownBtn from '@/components/organisms/dropdown/dropdown-btn/DropdownBtn.vue';
import { dropdownMenuBtnProps } from './PDropdownMenuBtn.toolset';

export default {
    name: 'PDropdownMenuBtn',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: { PDropdownBtn, PContextMenu },
    props: dropdownMenuBtnProps,
    setup(props, { emit }) {
        const popup = ref(false);
        const outsideClick = (): void => { popup.value = false; };
        const clickMenuEvent = (eventName: string, idx: number) => {
            emit('select', eventName, idx);
            emit(`click-${eventName}`, idx);
            popup.value = false;
        };

        return {
            popup,
            outsideClick,
            clickMenuEvent,
        };
    },
};
</script>
<style lang="postcss" scoped>
    .p-dropdown-menu-btn {
        position: relative;
    }
    .menu-ctx.block {
        width: 100%;
    }
</style>

<template>
    <div class="p-dropdown-menu-btn">
        <PDropdownBtn :popup.sync="popup" :block="block" @click="$emit('openMenu')">
            <slot />
        </PDropdownBtn>
        <PContextMenu v-if="popup"
                      class="menu-ctx"
                      :class="{block}"
                      :menu="menu"
                      :loading="loading"
                      @clickMenuEvent="clickMenuEvent"
        />
    </div>
</template>

<script>
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import PDropdownBtn from '@/components/organisms/dropdown/dropdown-btn/DropdownBtn.vue';

export default {
    name: 'PDropdownMenuBtn',
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
    },
    data() {
        return {
            popup: false,
        };
    },
    mounted() {
        window.addEventListener('click', this.windowClick);
    },
    destroyed() {
        window.removeEventListener('click', this.windowClick);
    },
    methods: {
        windowClick(event) {
            this.popup = false;
        },
        clickMenuEvent(eventName, idx) {
            this.$emit('clickMenuEvent', eventName, idx);
            this.$emit(`click-${eventName}`, idx);
            this.popup = false;
        },
    },
};
</script>
<style lang="scss" scoped>
    .p-dropdown-menu-btn{
        position: relative;
    }
    .menu-ctx.block {
        width: 100%;
    }
</style>

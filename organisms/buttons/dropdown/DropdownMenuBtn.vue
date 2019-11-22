<template>
    <div class="dropdown">
        <PDropdownBtn :popup.sync="popup">
            <slot />
        </PDropdownBtn>
        <PDropdownMenu
            v-if="popup"
            :menu="menu"
            @clickMenuEvent="clickMenuEvent"
        />
    </div>
</template>

<script>
import PDropdownMenu from '@/components/organisms/buttons/dropdown/DropdownMenu';
import PDropdownBtn from '@/components/organisms/buttons/dropdown/DropdownBtn';

export default {
    name: 'PDropdownMenuBtn',
    components: { PDropdownBtn, PDropdownMenu },
    props: {
        menu: {
            type: Array,
            default: () => [],
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

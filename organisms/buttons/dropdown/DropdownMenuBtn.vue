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
    methods: {
        clickMenuEvent(eventName) {
            this.$emit('clickMenuEvent', eventName);
            this.$emit(`click-${eventName}`);
            this.popup = false;
        },
    },
};
</script>

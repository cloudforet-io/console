<template>
    <p-pane-layout class="board-pane" v-on="$listeners">
        <div v-if="title" class="header" :class="{'no-pad': dropdownMenu}">
            <p class="title">
                {{ title }}
            </p>
            <p-dropdown-menu-btn v-if="dropdownMenu" :menu="dropdownMenu"
                                 v-on="$listeners"
            >
                {{ dropdownSelected }}
            </p-dropdown-menu-btn>
        </div>

        <slot />
    </p-pane-layout>
</template>

<script lang="ts">
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';

export default {
    name: 'PBoardLayout',
    components: { PPaneLayout, PDropdownMenuBtn },
    props: {
        title: {
            type: String,
            default: null,
        },
        dropdownMenu: {
            type: Array,
            default: null,
        },
        dropdownSelected: {
            type: String,
            default: null,
        },
    },
};
</script>

<style lang="postcss" scoped>
    .board-pane {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        .header {
            padding-top: 0.875rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            &.no-pad {
                padding-top: 0;
                height: 3rem;
            }
            .title {
                font-size: 1.125rem;
            }
        }
    }
</style>

<template>
    <div class="board-pane" v-on="$listeners">
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
    </div>
</template>

<script>
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn';

export default {
    name: 'PBoardLayout',
    components: { PDropdownMenuBtn },
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

<style lang="scss" scoped>
    .board-pane {
        @extend %pane;
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

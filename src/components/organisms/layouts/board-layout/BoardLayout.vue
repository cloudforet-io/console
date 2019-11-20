<template>
    <div class="board-pane">
        <div class="header">
            <p v-if="title" class="title">
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
import PDropdownMenuBtn from '@/components/organisms/buttons/dropdown/DropdownMenuBtn';

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
        padding: 16px;
        .header {
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
                font-size: 1.125rem;
            }
        }
    }
</style>

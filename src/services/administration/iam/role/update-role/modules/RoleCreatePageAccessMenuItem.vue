<template>
    <div class="role-create-page-access-menu-item">
        <div class="left-part">
            <p-icon-button v-if="!isSubMenu"
                           :name="menu.hideMenu ? 'ic_tree_arrow' : 'ic_tree_arrow--opened'"
                           size="sm"
                           @click="handleToggleMenuVisible"
            />
            <template v-for="(label, lIdx) in menu.labels">
                {{ label }}
                <p-i v-if="lIdx < menu.labels.length - 1"
                     :key="`label-${menu.labels.join('.')}-${lIdx}`"
                     name="ic_breadcrumb_arrow"
                     width="1rem" height="1rem"
                />
            </template>
        </div>
        <div class="right-part" :class="isSubMenu ? 'sub-menu' : 'menu'">
            <!-- song-lang -->
            <p-check-box :selected="menu.isViewed" :disabled="menu.isManaged" class="pr-6"
                         @change="handleChangeView"
            >
                <span>View</span>
            </p-check-box>
            <p-check-box :selected="menu.isManaged" @change="handleChangeManage">
                <span>Manage</span>
                <span v-if="isSubMenu" class="help-icon">
                    <p-i name="ic_help"
                         width="0.875rem" height="0.875rem"
                         color="inherit"
                    />
                </span>
            </p-check-box>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType } from '@vue/composition-api';
import {
    PCheckBox, PIconButton, PI,
} from '@spaceone/design-system';

import { PageAccessMenuItem } from '@/services/administration/iam/role/type';


export default {
    name: 'RoleCreatePageAccessMenuItem',
    components: {
        PCheckBox,
        PIconButton,
        PI,
    },
    props: {
        menu: {
            type: Object,
            default: () => ({}) as PropType<PageAccessMenuItem>,
        },
        isSubMenu: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        /* Event */
        const handleToggleMenuVisible = () => {
            const key = 'hideMenu';
            const val = !props.menu.hideMenu;
            emit('update', props.menu.id, key, val);
        };
        const handleChangeView = () => {
            const key = 'isViewed';
            const val = !props.menu.isViewed;
            emit('update', props.menu.id, key, val);
        };
        const handleChangeManage = () => {
            const key = 'isManaged';
            const val = !props.menu.isManaged;
            emit('update', props.menu.id, key, val);
        };

        return {
            handleToggleMenuVisible,
            handleChangeView,
            handleChangeManage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.role-create-page-access-menu-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;

    .left-part {
        flex-grow: 1;
    }
    .right-part {
        width: 12.5rem;
        &.menu {
            margin-right: 0.5rem;
        }
        .p-checkbox::v-deep {
            display: inline-flex;
            align-items: center;
            .text {
                padding-left: 0.375rem;
            }
        }
        .help-icon {
            @apply text-gray-400;
            margin-left: 0.25rem;
        }
    }

    @screen mobile {
        display: block;
    }
}
</style>

<template>
    <div class="role-create-page-access-menu-item"
         :class="[menu.isParent ? 'parent' : '', menu.id]"
    >
        <div class="left-part">
            <p-icon-button v-if="!isSubMenu"
                           :name="menu.hideMenu ? 'ic_tree_arrow' : 'ic_tree_arrow--opened'"
                           size="sm"
                           :disabled="isDisabled"
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
            <p-check-box :selected="menu.isViewed" :disabled="menu.isManaged" class="pr-6"
                         @change="handleChangeView"
            >
                <span>{{ $t('IAM.ROLE.FORM.VIEW') }}</span>
            </p-check-box>
            <p-check-box :selected="menu.isManaged" @change="handleChangeManage">
                <span>Manage</span>
            </p-check-box>
            <p-tooltip v-if="isSubMenu"
                       class="help-icon"
                       :contents="tooltipText"
                       :position="'bottom'"
            >
                <p-i name="ic_help"
                     width="0.875rem" height="0.875rem"
                     color="inherit"
                />
            </p-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, PropType, reactive, toRefs,
} from '@vue/composition-api';

import {
    PCheckBox, PIconButton, PI, PTooltip,
} from '@spaceone/design-system';


import { i18n } from '@/translations';

import { PageAccessMenuItem } from '@/services/administration/iam/role/type';


export default {
    name: 'RoleUpdatePageAccessMenuItem',
    components: {
        PCheckBox,
        PIconButton,
        PI,
        PTooltip,
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
        const state = reactive({
            tooltipText: computed(() => {
                const title = i18n.t('IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES');
                const features = [
                    i18n.t('IAM.ROLE.FORM.TOOLTIP_COLLECTING_DATA'),
                    i18n.t('IAM.ROLE.FORM.TOOLTIP_CHANGE_PROJECT'),
                    i18n.t('IAM.ROLE.FORM.TOOLTIP_CONNECT_TO_CONSOLE'),
                    i18n.t('IAM.ROLE.FORM.TOOLTIP_TAG_EDIT'),
                ];
                return `<b>${title}</b></br><ul>${features.map(d => `<li>&#8729; ${d}</li>`).join('')}</ul>`;
            }),
            isDisabled: computed(() => ((props.menu?.id === 'all') ? false : !props.menu?.subMenuList?.length)),
        });

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
            ...toRefs(state),
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

    &.parent {
        padding: 0.75rem 0.5rem;
        .right-part {
            margin-right: 1rem;
        }
    }
    &.all {
        .right-part {
            margin-right: 0.5rem;
        }
    }
    .left-part {
        flex-grow: 1;
    }
    .right-part {
        display: flex;
        align-items: center;
        width: 12rem;
        .p-checkbox::v-deep {
            display: inline-flex;
            align-items: center;
            .text {
                display: flex;
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
        .right-part {
            padding-left: 1rem;
            padding-top: 0.75rem;
            &.sub-menu {
                padding-left: 0;
            }
        }
    }
}
</style>

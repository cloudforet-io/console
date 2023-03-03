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
            <template v-for="(translationId, lIdx) in menu.translationIds">
                {{ $t(translationId) }}
                <p-i v-if="lIdx < menu.translationIds.length - 1"
                     :key="`label-${menu.translationIds.join('.')}-${lIdx}`"
                     name="ic_chevron-left-thin"
                     width="1rem"
                     height="1rem"
                />
            </template>
        </div>
        <div class="right-part"
             :class="isSubMenu ? 'sub-menu' : 'menu'"
        >
            <p-checkbox :selected="menu.isViewed"
                        :disabled="menu.isManaged"
                        class="pr-6"
                        @change="handleChangeView"
            >
                <span>{{ $t('IAM.ROLE.FORM.VIEW') }}</span>
            </p-checkbox>
            <p-checkbox :selected="menu.isManaged"
                        @change="handleChangeManage"
            >
                <span>Manage</span>
            </p-checkbox>
            <p-tooltip v-if="tooltipText"
                       class="help-icon"
                       :contents="tooltipText"
                       :position="'bottom'"
            >
                <p-i name="ic_question-mark-circle"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                />
            </p-tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PCheckbox, PIconButton, PI, PTooltip,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { MANAGE_FEATURE_MAP } from '@/services/administration/iam/role/config';
import type { PageAccessMenuItem } from '@/services/administration/iam/role/type';

export default {
    name: 'RoleUpdatePageAccessMenuItem',
    components: {
        PCheckbox,
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
                const { title, features } = MANAGE_FEATURE_MAP[props.menu?.id] ?? {};
                if (!title) return null;
                return `<b>${i18n.t(title)}</b></br><ul>${features.map((d) => `<li>&#8729; ${i18n.t(d)}</li>`).join('')}</ul>`;
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

        /* custom design-system component - p-checkbox */
        :deep(.p-checkbox) {
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

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PFieldTitle } from '@spaceone/design-system';

import RoleUpdateFormAccessMenuItem from '@/services/administration/components/RoleUpdateFormAccessMenuItem.vue';
import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/administration/types/page-access-menu-type';

interface Props {
    menuItems?: PageAccessMenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
    menuItems: undefined,
});

const emit = defineEmits<{(e: 'update', value: UpdateFormDataType): void,
}>();

const state = reactive({
    hideAllMenu: computed(() => props.menuItems?.find((d) => d.id === 'all')?.hideMenu),
});

/* Component */
const handleUpdate = (value: UpdateFormDataType) => {
    emit('update', value);
};
</script>

<template>
    <div class="role-update-page-access">
        <p-field-title :label="$t('IAM.ROLE.DETAIL.PAGE_ACCESS')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <div class="page-access-menu">
            <div class="header-wrapper">
                <span class="left-part">{{ $t('IAM.ROLE.FORM.MENU') }}</span>
                <span class="right-part mr-6">{{ $t('IAM.ROLE.FORM.ACCESS') }}</span>
            </div>
            <div class="content-wrapper">
                <template v-for="menu in props.menuItems">
                    <div v-if="menu.id === 'all' || !state.hideAllMenu"
                         :key="menu.id"
                         class="menu-wrapper"
                         :class="menu.id"
                    >
                        <role-update-form-access-menu-item :menu="menu"
                                                           @update="handleUpdate"
                        />
                        <template v-for="subMenu in menu.subMenuList">
                            <div v-if="menu.subMenuList && !menu.hideMenu && !state.hideAllMenu"
                                 :key="subMenu.id"
                                 class="sub-menu-wrapper"
                            >
                                <role-update-form-access-menu-item :menu="subMenu"
                                                                   is-sub-menu
                                                                   @update="handleUpdate"
                                />
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.role-update-page-access {
    @apply flex flex-col;
    margin: 0 1rem 2.5rem 1rem;
    gap: 0.5rem;
    .page-access-menu {
        @apply border border-gray-200 rounded-md;
        max-width: 60rem;
        font-size: 0.875rem;
        line-height: 1.25;
        .header-wrapper {
            @apply text-gray-500 border-b border-gray-200;
            display: flex;
            font-size: 0.75rem;
            line-height: 1.25;
            padding: 0.5rem 1rem;
        }
        .content-wrapper {
            height: 27.875rem;
            overflow-y: auto;
        }
        .menu-wrapper {
            @apply bg-gray-100 border border-gray-200 rounded-md;
            margin: 0.5rem 1rem;
            &.all {
                @apply bg-transparent border-none;
                margin: 0.5rem 1rem 0.5rem 0;
            }
            .sub-menu-wrapper {
                @apply bg-white rounded-md;
                margin: 0.25rem 0.5rem;
            }
        }
        .left-part {
            flex-grow: 1;
        }
    }
}
</style>

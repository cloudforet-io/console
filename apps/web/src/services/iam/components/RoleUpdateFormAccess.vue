<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PFieldTitle, PI, PToggleButton } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import { gray, green } from '@/styles/colors';

import RoleUpdateFormAccessMenuItem from '@/services/iam/components/RoleUpdateFormAccessMenuItem.vue';
import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/iam/types/role-type';

interface Props {
    menuItems?: PageAccessMenuItem[]
    roleType?: RoleType
}

const props = withDefaults(defineProps<Props>(), {
    menuItems: undefined,
    roleType: ROLE_TYPE.DOMAIN_ADMIN,
});

const emit = defineEmits<{(e: 'update', value: UpdateFormDataType): void,
}>();

const state = reactive({
    hideAllMenu: computed(() => props.menuItems?.find((d) => d.id === 'all')?.hideMenu),
    menuItems: [] as PageAccessMenuItem[],
    isReadOnly: false,
});

/* Component */
const handleUpdate = (value: UpdateFormDataType) => {
    emit('update', value);
};
const handleChangeToggle = (value: boolean) => {
    state.isReadOnly = value;
};

/* Watcher */
watch(() => props.menuItems, (menuItems) => {
    state.menuItems = menuItems || [];
}, { immediate: true });
</script>

<template>
    <div class="role-update-page-access">
        <p-field-title :label="$t('IAM.ROLE.DETAIL.PAGE_ACCESS')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <div v-if="props.roleType === ROLE_TYPE.DOMAIN_ADMIN">
            <div class="page-access-info-wrapper">
                <p-i name="ic_settings"
                     width="2rem"
                     height="2rem"
                     class="setting-icon"
                     :color="gray[900]"
                />
                <div class="page-access-info">
                    <p class="title">
                        {{ $t('IAM.ROLE.FORM.FULL_ACCESS') }}
                    </p>
                    <div class="page-access-desc">
                        <p-i name="ic_check-circle"
                             width="1.125rem"
                             height="1.125rem"
                             class="check-circle-icon"
                             :color="green[600]"
                        />
                        <span class="desc">{{ $t('IAM.ROLE.FORM.ADMIN_CENTER') }}</span>
                    </div>
                    <div class="page-access-desc">
                        <p-i name="ic_check-circle"
                             width="1.125rem"
                             height="1.125rem"
                             class="check-circle-icon"
                             :color="green[600]"
                        />
                        <span class="desc">{{ $t('IAM.ROLE.FORM.ALL_WORKSPACES') }}</span>
                    </div>
                </div>
            </div>
            <div class="page-access-info-wrapper">
                <p-toggle-button :value="state.isReadOnly"
                                 @change-toggle="handleChangeToggle"
                />
                <span>{{ $t('IAM.ROLE.FORM.READ_ONLY_PERMISSIONS') }}</span>
            </div>
        </div>
        <div v-else
             class="page-access-menu"
        >
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
    margin: 0 1rem 1.5rem 1rem;
    gap: 0.5rem;
    .page-access-menu {
        @apply border border-gray-200 rounded-md;
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
    .page-access-info-wrapper {
        @apply flex items-start border border-gray-200 rounded-md;
        padding: 1.375rem 1rem;
        gap: 0.5rem;
        .setting-icon {
            margin-top: -0.375rem;
        }
        .page-access-info {
            @apply flex flex-col;
            gap: 0.25rem;
            .title {
                @apply text-gray-900 font-medium;
                margin-bottom: 0.375rem;
            }
            .desc {
                @apply text-label-md text-gray-700;
            }
        }
        & + .page-access-info-wrapper {
            @apply items-center;
            margin-top: 0.5rem;
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
    }
}
</style>

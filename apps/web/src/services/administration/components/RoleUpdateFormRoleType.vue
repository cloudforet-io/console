<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldTitle,
    PHeading,
    PPaneLayout,
    PSelectCard,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { i18n } from '@/translations';

import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/constants/role-constant';
import type { RoleFormData } from '@/services/administration/types/role-type';

interface RoleTypeForm {
    label: string;
    key: RoleType;
    description: string;
}
interface Props {
    initialData?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: undefined,
});

const emit = defineEmits<{(e: 'update-form', formData: RoleFormData): void}>();

const state = reactive({
    roleTypes: computed<RoleTypeForm[]>(() => [
        {
            label: ROLE_TYPE_BADGE_OPTION.DOMAIN_ADMIN.label,
            key: ROLE_TYPE.DOMAIN_ADMIN,
            description: i18n.t('IAM.ROLE.FORM.DESC_ADMIN') as string,
        },
        {
            label: ROLE_TYPE_BADGE_OPTION.WORKSPACE_OWNER.label,
            key: ROLE_TYPE.WORKSPACE_OWNER,
            description: i18n.t('IAM.ROLE.FORM.DESC_WORKSPACE_OWNER') as string,
        },
        {
            label: ROLE_TYPE_BADGE_OPTION.WORKSPACE_MEMBER.label,
            key: ROLE_TYPE.WORKSPACE_MEMBER,
            description: i18n.t('IAM.ROLE.FORM.DESC_WORKSPACE_MEMBER') as string,
        },
    ]),
    selectedRoleType: ROLE_TYPE.DOMAIN_ADMIN as RoleType,
    savedRoleType: computed<RoleTypeForm|undefined>(() => state.roleTypes.find((type) => type.key === props.initialData)),
});

/* Watcher */
watch(() => state.selectedRoleType, (value) => {
    emit('update-form', { role_type: value });
});
watch(() => props.initialData, (initialData) => {
    if (!initialData) return;
    state.selectedRoleType = initialData as RoleType;
});
</script>

<template>
    <p-pane-layout class="role-update-page-role-type">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.ROLE_TYPE')"
        />
        <div class="select-card-wrapper">
            <p-select-card v-for="(roleType, index) in state.roleTypes"
                           :key="roleType.key"
                           v-model="state.selectedRoleType"
                           :tab-index="index"
                           class="card"
                           :value="roleType.key"
                           :label="roleType.label"
            >
                <div class="card-content">
                    <img :src="useRoleFormatter(roleType.key).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <p-field-title class="role-type-name">
                        {{ roleType.label }}
                    </p-field-title>
                    <span class="role-type-description">
                        {{ roleType.description }}
                    </span>
                </div>
            </p-select-card>
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.role-update-page-role-type {
    .select-card-wrapper {
        @apply flex flex-wrap mx-4 mb-8;
        max-width: 60rem;
        gap: 0.5rem;
        .card {
            flex: 1;
            .card-content {
                @apply inline-flex flex-col items-center justify-center;
                gap: 0.25rem;
                .role-type-icon {
                    @apply rounded-full;
                    width: 3.125rem;
                    height: 3.125rem;
                    margin-bottom: 0.125rem;
                }
                .role-type-description {
                    @apply text-label-md text-gray-500 text-center;
                    max-width: 17.125rem;
                    margin: auto;
                }
            }
        }

        /* custom design-system component - p-select-card */
        :deep(.p-select-card) {
            &.selected {
                .role-type-name {
                    @apply text-blue-600;
                }
            }
        }

        @screen tablet {
            @apply flex-col;
            max-width: 43rem;
            .card {
                padding-top: 1rem;
                padding-bottom: 1rem;
                .card-content {
                    .role-type-icon {
                        @apply hidden;
                    }
                    .role-type-description {
                        max-width: unset;
                    }
                }
            }
        }
    }
    .role-type-saved-text {
        font-size: 0.875rem;
        line-height: 1.3125rem;
    }
}
</style>

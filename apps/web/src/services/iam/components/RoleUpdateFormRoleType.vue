<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldTitle,
    PHeading,
    PPaneLayout,
    PSelectCard,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import { i18n } from '@/translations';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { FORM_TYPE, ROLE_TYPE_BADGE_OPTION } from '@/services/iam/constants/role-constant';
import type { RoleFormData } from '@/services/iam/types/role-type';

interface RoleTypeForm {
    label: string;
    key: RoleType;
    description: string;
}
interface Props {
    initialData?: string;
    formType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initialData: undefined,
    formType: FORM_TYPE.CREATE,
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

/* Component */
const handleChangeCard = (value: string) => {
    if (props.formType === FORM_TYPE.UPDATE) return;
    state.selectedRoleType = value;
};

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
        <p-heading class="mt-8 mx-4 mb-6"
                   heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.ROLE_TYPE')"
        />
        <div class="select-card-wrapper">
            <p-select-card v-for="(roleType, index) in state.roleTypes"
                           :key="roleType.key"
                           :selected="state.selectedRoleType"
                           :tab-index="index"
                           :disabled="props.formType === FORM_TYPE.UPDATE && state.selectedRoleType !== roleType.key"
                           class="card"
                           :value="roleType.key"
                           :label="roleType.label"
                           @change="handleChangeCard"
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
    max-width: 100%;
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
            &.disabled {
                .card-content {
                    opacity: 0.2;
                }
                .marker {
                    @apply hidden;
                }
            }
        }

        @screen tablet {
            flex-direction: column;
            max-width: 43rem;
            .card {
                padding-top: 1rem;
                padding-bottom: 1rem;
                .card-content {
                    .role-type-icon {
                        display: none;
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

<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PPaneLayout, PHeading, PFieldGroup, PFieldTitle, PTextInput, PSelectCard,
} from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/constants/role-constant';
import type { BaseInfoFormData } from '@/services/administration/types/role-form-type';


interface RoleTypeForm {label: string; key: string; description: TranslateResult}
interface Props {
    initialFormData?: BaseInfoFormData;
    roleTypeInputDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initialFormData: undefined,
    roleTypeInputDisabled: false,
});

const emit = defineEmits<{(e: 'update-validation', after: boolean): void,
    (e: 'update-form', after: BaseInfoFormData): void,
}>();

const state = reactive({
    roleDescription: undefined as undefined | string,
    roleTypes: computed<RoleTypeForm[]>(() => [
        { label: ROLE_TYPE_BADGE_OPTION.DOMAIN_ADMIN.label, key: ROLE_TYPE.DOMAIN_ADMIN, description: i18n.t('Access to all workspaces, including Admin Mode.') },
        {
            label: ROLE_TYPE_BADGE_OPTION.WORKSPACE_OWNER.label,
            key: ROLE_TYPE.WORKSPACE_OWNER,
            description: i18n.t('Access to all projects within their designated workspace.'),
        },
        {
            label: ROLE_TYPE_BADGE_OPTION.WORKSPACE_MEMBER.label,
            key: ROLE_TYPE.WORKSPACE_MEMBER,
            description: i18n.t('Access to projects they are invited to or have been granted permission for.'),
        },
    ]),
    selectedRoleType: ROLE_TYPE.DOMAIN_ADMIN as RoleType,
    savedRoleType: computed<RoleTypeForm|undefined>(() => {
        const roleType = props.initialFormData?.roleType;
        return state.roleTypes.find((type) => type.key === roleType);
    }),
});

const {
    forms: {
        roleName,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    roleName: undefined,
}, {
    roleName(value?: string) {
        if (value === undefined) return '';
        return value.trim().length > 2 ? '' : i18n.t('IAM.ROLE.FORM.VALIDATION_ROLE_NAME');
    },
});

watch(() => isAllValid.value, (after) => {
    emit('update-validation', after);
}, { immediate: true });
watch([() => state.selectedRoleType, () => state.roleDescription, () => roleName.value], ([selectedRoleType, roleDescription, roleNameValue]) => {
    emit('update-form', { roleName: roleNameValue, roleDescription, roleType: selectedRoleType });
}, { immediate: true });
watch(() => props.initialFormData, (initialFormData) => {
    setForm('roleName', initialFormData.roleName);
    state.roleDescription = initialFormData.roleDescription;
    state.selectedRoleType = initialFormData.roleType;
});
</script>

<template>
    <p-pane-layout class="role-update-page-base-information">
        <p-heading heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.BASE_INFORMATION')"
        />
        <div class="input-wrapper">
            <p-field-group
                :label="$t('IAM.ROLE.DETAIL.NAME')"
                :invalid="invalidState.roleName"
                :invalid-text="invalidTexts.roleName"
                required
            >
                <template #default="{invalid}">
                    <p-text-input class="role-name-input input"
                                  :value="roleName"
                                  :invalid="invalid"
                                  @update:value="setForm('roleName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('IAM.ROLE.DETAIL.DESCRIPTION')"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="state.roleDescription"
                                  class="role-description-input input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-title :label="$t('IAM.ROLE.DETAIL.ROLE_TYPE')" />
            <div v-if="!roleTypeInputDisabled"
                 class="select-card-wrapper"
            >
                <p-select-card v-for="(roleType, index) in state.roleTypes"
                               :key="roleType.key"
                               v-model="state.selectedRoleType"
                               :tab-index="index"
                               class="card"
                               :value="roleType.key"
                               :label="roleType.label"
                >
                    <p-field-title class="role-type-name">
                        {{ roleType.label }}
                    </p-field-title>
                    <p class="role-type-description">
                        {{ roleType.description }}
                    </p>
                </p-select-card>
            </div>
            <span v-else-if="state.savedRoleType"
                  class="role-type-saved-text"
            >{{ `${state.savedRoleType.label} (${state.savedRoleType.description})` }}</span>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.role-update-page-base-information {
    @apply mx-0;
    max-width: 100%;

    .input-wrapper {
        @apply mx-4 mb-8 flex flex-wrap gap-1 flex-col;

        .input {
            max-width: 43.5rem;
            width: 100%;
        }

        .select-card-wrapper {
            @apply flex flex-wrap gap-2 w-full;
            max-width: 43.5rem;
            .card {
                width: calc(50% - 0.25rem);

                /* custom design-system component - p-select-card */
                :deep(&) {
                    .marker {
                        display: none;
                    }
                    &.selected {
                        .marker {
                            display: block;
                        }
                        .role-type-name {
                            @apply text-blue-600;
                        }
                        .role-type-description {
                            @apply text-blue-500;
                        }
                    }
                }
                .role-type-description {
                    @apply text-gray-500;
                    font-size: 0.75rem;
                }
            }
        }
        .role-type-saved-text {
            font-size: 0.875rem;
            line-height: 1.3125rem;
        }
    }
}
</style>

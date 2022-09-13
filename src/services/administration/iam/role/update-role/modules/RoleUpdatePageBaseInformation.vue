<template>
    <p-pane-layout class="role-update-page-base-information">
        <p-panel-top>
            {{ $t('IAM.ROLE.DETAIL.BASE_INFORMATION') }}
        </p-panel-top>
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
                                  @input="setForm('roleName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('IAM.ROLE.DETAIL.DESCRIPTION')"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="roleDescription"
                                  class="role-description-input input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-label :label="$t('IAM.ROLE.DETAIL.ROLE_TYPE')" />
            <div v-if="!roleTypeInputDisabled" class="select-card-wrapper">
                <p-select-card v-for="roleType in roleTypes" :key="roleType.key"
                               v-model="selectedRoleType"
                               class="card"
                               :value="roleType.key"
                               :label="roleType.label"
                >
                    <p-label class="role-type-name">
                        {{ roleType.label }}
                    </p-label>
                    <p class="role-type-description">
                        {{ roleType.description }}
                    </p>
                </p-select-card>
            </div>
            <span v-else class="role-type-saved-text">{{ `${savedRoleType.label} (${savedRoleType.description})` }}</span>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PFieldGroup, PLabel, PTextInput, PSelectCard,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';


import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';


import type { RoleType } from '@/services/administration/iam/role/config';
import { ROLE_TYPE, ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import type { BaseInfoFormData } from '@/services/administration/iam/role/update-role/modules/RoleUpdateForm.vue';

export default {
    name: 'RoleUpdatePageBaseInformation',
    components: {
        PPaneLayout,
        PPanelTop,
        PFieldGroup,
        PTextInput,
        PLabel,
        PSelectCard,
    },
    props: {
        initialFormData: {
            type: Object as PropType<BaseInfoFormData>,
            default: () => ({}),
        },
        roleTypeInputDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const {
            forms: {
                roleName,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        } = useFormValidator({
            roleName: '',
        }, {
            roleName(value: string) { return value.trim().length > 2 ? '' : i18n.t('IAM.ROLE.FORM.VALIDATION_ROLE_NAME'); },
        });

        const state = reactive({
            roleDescription: undefined as undefined | string,
            roleTypes: computed(() => [
                { label: ROLE_TYPE_BADGE_OPTION.PROJECT.label, key: ROLE_TYPE.PROJECT, description: i18n.t('IAM.ROLE.FORM.ROLE_TYPE_PROJECT') },
                { label: ROLE_TYPE_BADGE_OPTION.DOMAIN.label, key: ROLE_TYPE.DOMAIN, description: i18n.t('IAM.ROLE.FORM.ROLE_TYPE_DOMAIN') },
            ]),
            selectedRoleType: ROLE_TYPE.PROJECT as RoleType,
            savedRoleType: computed(() => {
                const roleType = props.initialFormData?.roleType;
                return state.roleTypes.find(type => type.key === roleType);
            }),
        });
        watch(() => isAllValid.value, (after) => {
            emit('update-validation', after);
        }, { immediate: true });
        watch([() => state.selectedRoleType, () => state.roleDescription, () => roleName.value], ([selectedRoleType, roleDescription, roleNameValue]) => {
            emit('update-form', { roleName: roleNameValue, roleDescription, roleType: selectedRoleType });
        });
        watch(() => props.initialFormData, (initialFormData) => {
            setForm('roleName', initialFormData.roleName);
            state.roleDescription = initialFormData.roleDescription;
            state.selectedRoleType = initialFormData.roleType;
        });
        return {
            ...toRefs(state),
            roleName,
            setForm,
            invalidState,
            invalidTexts,
            isAllValid,
        };
    },
};
</script>

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
                &::v-deep {
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

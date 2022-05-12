<template>
    <p-pane-layout class="role-update-page-base-information">
        <p-panel-top>
            <!-- song-lang -->
            Base Information
        </p-panel-top>
        <div class="input-wrapper">
            <!--            song-lang-->
            <p-field-group
                :label="$t('Name')"
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
            <!--            song-lang-->
            <p-field-group
                :label="$t('Description')"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="roleDescription"
                                  class="role-description-input input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <!--            song-lang-->
            <p-label :label="$t('Role Type')" />
            <div class="select-card-wrapper">
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
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PFieldGroup, PLabel, PTextInput, PSelectCard,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useFormValidator } from '@/common/composables/form-validator';
import { i18n } from '@/translations';
import { ROLE_TYPE, ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';

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
            roleName(value: string) { return value.trim().length > 2 ? '' : i18n.t('Must be longer than 2 characters'); }, // song-lang
        });

        const state = reactive({
            roleDescription: undefined as undefined | string,
            roleTypes: computed(() => [ // song-lang
                { label: ROLE_TYPE_BADGE_OPTION.PROJECT.label, key: ROLE_TYPE.PROJECT, description: 'Invited projects only' },
                { label: ROLE_TYPE_BADGE_OPTION.DOMAIN.label, key: ROLE_TYPE.DOMAIN, description: 'All projects' },
            ]),
            selectedRoleType: ROLE_TYPE.PROJECT as string,
        });
        watch(() => isAllValid.value, (after) => {
            emit('update-validation', after);
        }, { immediate: true });
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
                    }
                }
                .role-type-description {
                    @apply text-gray-500;
                    font-size: 0.75rem;
                }
            }
        }
    }
}
</style>

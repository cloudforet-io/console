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
                :invalid="roleName"
                :valid="false"
                :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="roleName"
                                  class="role-name-input input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <!--            song-lang-->
            <p-field-group
                :label="$t('Description')"
                :invalid="roleDescription"
                :valid="false"
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
import { computed, reactive, toRefs } from '@vue/composition-api';

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
    setup() {
        const state = reactive({
            roleName: undefined as undefined | string,
            roleDescription: undefined as undefined | string,
            roleTypes: computed(() => [ // song-lang
                { label: 'User', key: 'user', description: 'Invited projects only' },
                { label: 'Admin', key: 'admin', description: 'All projects' },
            ]),
            selectedRoleType: undefined as undefined | string,
        });
        return {
            ...toRefs(state),
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

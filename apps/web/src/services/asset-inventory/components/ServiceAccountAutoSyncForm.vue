<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PJsonSchemaForm, PFieldTitle, PPaneLayout, PToggleButton, PFieldGroup, PRadio,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';

import WorkspaceDropdown from '@/services/asset-inventory/components/WorkspaceDropdown.vue';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';


const MAX_TIME_COUNT = 2;

interface Props {
    isValid: boolean;
    originForm?: any;
    isUpdateMode?: boolean;
    isReadMode?: boolean;
}

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const serviceAccountPageGetters = serviceAccountPageStore.getters;

const props = withDefaults(defineProps<Props>(), {
    isValid: false,
    originForm: () => ({}),
    isReadMode: false,
});

const emit = defineEmits<{(e:'update:isValid', isValid: boolean): void;
    (e:'change', formData: any): void;
}>();

const cspAdditionalOptionMap = {
    aws: {
        name: 'AWS Organization',
        workspaceMappingOptions: [
            {
                label: 'Top-level Organization Units',
                value: 'multipleWorkspaces',
            },
            {
                label: 'AWS Organization',
                value: 'singleWorkspace',
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Nested Organization Units',
                value: 'projectGroups',
            },
        ],
    },
    azure: {
        name: 'Azure Tenant',
        workspaceMappingOptions: [
            {
                label: 'Multitenant Organization',
                value: 'multipleWorkspaces',
            },
            {
                label: 'Azure Tenant',
                value: 'singleWorkspace',
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Nested Management Groups',
                value: 'projectGroups',
            },
        ],
    },
    google_cloud: {
        name: 'Google Cloud Organization',
        workspaceMappingOptions: [
            {
                label: 'Top-level Organization Units',
                value: 'multipleWorkspaces',
            },
            {
                label: 'Google Cloud Organization',
                value: 'singleWorkspace',
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Google Cloud Folders',
                value: 'projectGroups',
            },
        ],
    },
};

const additionalOptionState = reactive({
    additionalOptionUiByProvider: computed(() => cspAdditionalOptionMap[serviceAccountPageState.selectedProvider] ?? {}),
    workspaceMapping: 'multipleWorkspaces',
    projectGroupMapping: 'projectGroups',
    additionalOptions: {},
});

const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    scheduleHelpText: computed(() => i18n.t('INVENTORY.SERVICE_ACCOUNT.CREATE.TIMEZONE', { timezone: state.timezone })),
    isAutoSyncEnabled: true,
    domainName: computed(() => store.state.domain.name),
    mappingItems: computed(() => [
        {
            imageUrl: serviceAccountPageStore.getters.selectedProviderItem?.icon,
            name: 'provider',
        },
        {
            icon: 'ic_workspaces',
            name: 'workspace',
        },
        {
            icon: 'ic_document-filled',
            name: 'project_group',
        },
    ]),
    selectedWorkspace: '',
    timezoneAppliedHours: computed<number[]>(() => {
        if (state.timezone === 'UTC') return serviceAccountPageState.scheduleHours;
        // set an hour as utc and get the hour in timezone
        return serviceAccountPageState.scheduleHours.map((utcHour) => dayjs.utc()
            .hour(utcHour).tz(state.timezone)
            .get('hour')).sort((a, b) => a - b);
    }),
    formData: computed(() => ({
        additionalOptions: additionalOptionState.additionalOptions,
        scheduleHours: serviceAccountPageGetters.scheduleHours,
        selectedSingleWorkspace: additionalOptionState.workspaceMapping === 'singleWorkspace' ? state.selectedWorkspace : '',
        skipProjectGroupMapping: additionalOptionState.projectGroupMapping === 'skip',
    })),
});

const hoursMatrix: number[] = range(24);
const selectedUtcHoursSet = new Set<number>();

const updateSelectedHours = () => {
    const hours: number[] = Array.from(selectedUtcHoursSet.values());
    serviceAccountPageStore.$patch((_state) => {
        _state.state.scheduleHours = hours;
    });
};

const handleClickHour = (hour: number) => {
    if (props.isReadMode) return;
    let utcHour: number;
    if (state.timezone === 'UTC') utcHour = hour;
    else {
        // set an hour as timezone and get the hour in utc
        utcHour = dayjs().tz(state.timezone)
            .hour(hour).utc()
            .get('hour');
    }
    if (selectedUtcHoursSet.has(utcHour)) {
        selectedUtcHoursSet.delete(utcHour);
    } else if (Array.from(selectedUtcHoursSet.values()).length < MAX_TIME_COUNT) {
        selectedUtcHoursSet.add(utcHour);
    }

    updateSelectedHours();
};
const handleAdditionalOptionsValidate = (isValid:boolean) => {
    if (state.isAutoSyncEnabled) {
        emit('update:isValid', true);
    } else emit('update:isValid', isValid);
};

const handleUpdateWorkspace = (workspaceId:string) => {
    state.selectedWorkspace = workspaceId;
};

const handleChangeToggle = (e:boolean) => {
    state.isAutoSyncEnabled = e;
};

(() => {
    serviceAccountPageStore.setAutoSyncAdditionalOptions();
})();

watch(() => state.formData, (formData) => {
    emit('change', formData);
});

</script>

<template>
    <div class="service-account-auto-sync-form">
        <div class="auto-sync-toggle">
            <p-toggle-button v-if="serviceAccountPageStore.getters.autoSyncAdditionalOptions"
                             :value="state.isAutoSyncEnabled"
                             show-state-text
                             position="left"
                             @change-toggle="handleChangeToggle"
            /><p>{{ `Automatically synchronize AWS sub-accounts with ${state.domainName}.` }}</p>
        </div>
        <div v-if="state.isAutoSyncEnabled">
            <p-field-title label="Mapping Method"
                           size="lg"
                           class="mb-2"
            />
            <mapping-method :items="state.mappingItems"
                            class="mb-6"
            >
                <template #provider>
                    <p>{{ additionalOptionState.additionalOptionUiByProvider.name }}</p>
                </template>
                <template #workspace>
                    <div>
                        <p-field-title label="Workspace Mapping"
                                       size="md"
                                       class="mb-1"
                        />
                        <div class="flex flex-col gap-1">
                            <p-radio v-for="option in additionalOptionState.additionalOptionUiByProvider.workspaceMappingOptions"
                                     :key="option.value"
                                     v-model="additionalOptionState.workspaceMapping"
                                     :value="option.value"
                            >
                                {{ `${option.label} ➔ ${option.value === 'multipleWorkspaces' ? 'Multiple workspaces' : 'Single Workspace'}` }}
                            </p-radio>
                        </div>
                        <div>
                            <workspace-dropdown :disabled="additionalOptionState.workspaceMapping !== 'singleWorkspace'"
                                                class="mt-2"
                                                @update="handleUpdateWorkspace"
                            />
                        </div>
                    </div>
                </template>
                <template #project_group>
                    <div>
                        <p-field-title label="Project Group Mapping"
                                       size="md"
                                       class="mb-1"
                        />
                        <div class="flex flex-col gap-1">
                            <p-radio v-for="option in additionalOptionState.additionalOptionUiByProvider.projectGroupMappingOptions"
                                     :key="option.value"
                                     v-model="additionalOptionState.projectGroupMapping"
                                     :value="option.value"
                            >
                                {{ `${option.label} ➔ ${option.value === 'projectGroups' ? 'Project Groups' : 'Skip'}` }}
                            </p-radio>
                            <p-radio v-model="additionalOptionState.projectGroupMapping"
                                     value="skip"
                            >
                                {{ $t('Skip project group mapping') }}
                            </p-radio>
                        </div>
                    </div>
                </template>
            </mapping-method>

            <p-field-title label="Additional Options"
                           size="lg"
                           class="mb-2"
            />
            <p-pane-layout class="p-4 mb-8">
                <p-json-schema-form v-if="serviceAccountPageStore.getters.autoSyncAdditionalOptions"
                                    class="p-json-schema-form"
                                    :form-data.sync="additionalOptionState.additionalOptions"
                                    :schema="serviceAccountPageStore.getters.autoSyncAdditionalOptions"
                                    :language="$store.state.user.language"
                                    @validate="handleAdditionalOptionsValidate"
                />
            </p-pane-layout>
            <p-field-title label="Hourly Sync Schedule"
                           size="lg"
                           class="mb-1"
            />
            <p-field-group class="hourly-schedule-field-group"
                           :help-text="state.scheduleHelpText"
            >
                <div class="hourly-schedule-wrapper"
                     :class="{'is-read-mode': props.isReadMode}"
                >
                    <span v-for="(hour) in hoursMatrix"
                          :key="hour"
                          class="time-block"
                          :class="{
                              active: !!state.timezoneAppliedHours.includes(hour)
                          }"
                          @click="handleClickHour(hour)"
                    >
                        {{ hour }}
                    </span>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-auto-sync-form {
    margin-left: 1rem;

    .auto-sync-toggle {
        @apply text-paragraph-lg flex items-center gap-4;
        margin-bottom: 1.5rem;
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.p-json-schema-form) {

        .p-field-group {
            margin-bottom: 1.5rem;
            max-width: 30rem;
            width: 100%;
        }

        .p-text-input {
            width: 100%;
        }
    }

    .hourly-schedule-field-group {
        margin-bottom: 1.875rem;

        .hourly-schedule-wrapper {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(12, 2rem);
            grid-template-rows: auto;

            @screen mobile {
                grid-template-columns: repeat(4, 2rem);
            }

            &.is-read-mode {
                gap: 0.25rem;
                .time-block {
                    @apply bg-gray-100 text-gray-100 border-none cursor-default;
                    &.active {
                        @apply bg-blue-200 text-blue-600;
                    }
                }
            }

            .time-block {
                @apply flex items-center justify-center bg-white border border-gray-300 rounded-xs box-border cursor-pointer;
                height: 2rem;
                font-size: 0.875rem;
                &.active {
                    @apply bg-blue-600 text-white;
                }
            }
        }
    }
}

</style>

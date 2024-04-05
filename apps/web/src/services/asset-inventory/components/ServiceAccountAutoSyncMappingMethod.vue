<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { PFieldTitle, PRadio } from '@spaceone/design-system';

import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';

import WorkspaceDropdown from '@/services/asset-inventory/components/WorkspaceDropdown.vue';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';

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
                label: 'Top-level Folders in Google Cloud Organization',
                value: 'multipleWorkspaces',
            },
            {
                label: 'Google Cloud Organization',
                value: 'singleWorkspace',
            },
        ],
        projectGroupMappingOptions: [
            {
                label: 'Folders in Google Cloud Organization',
                value: 'projectGroups',
            },
        ],
    },
};

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;

const state = reactive({
    selectedWorkspace: computed(() => serviceAccountPageStore.formState.selectedSingleWorkspace ?? ''),
    additionalOptionUiByProvider: computed(() => cspAdditionalOptionMap[serviceAccountPageState.selectedProvider] ?? {}),
    workspaceMapping: 'multipleWorkspaces',
    projectGroupMapping: 'projectGroups',
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
    formData: computed(() => ({
        selectedSingleWorkspace: state.workspaceMapping === 'singleWorkspace' ? state.selectedWorkspace : '',
        skipProjectGroup: state.projectGroupMapping === 'skip',
    })),
});

const handleUpdateWorkspace = (workspaceId:string) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.selectedSingleWorkspace = workspaceId;
    });
};

watch(() => state.formData, (formData) => {
    Object.entries(formData).forEach(([key, value]) => {
        serviceAccountPageStore.setFormState(key, value);
    });
});

watch(() => serviceAccountPageState.serviceAccountItem, (item) => {
    if (item) {
        state.workspaceMapping = item.sync_options?.single_workspace_id ? 'singleWorkspace' : 'multipleWorkspaces';
        state.projectGroupMapping = item.sync_options?.skip_project_group ? 'skip' : 'projectGroups';
    }
}, { immediate: true });

</script>

<template>
    <div class="service-account-auto-sycn-mapping-method">
        <p-field-title label="Mapping Method"
                       size="lg"
                       class="mb-2"
        />
        <mapping-method :items="state.mappingItems"
                        class="mb-6"
        >
            <template #provider>
                <p>{{ state.additionalOptionUiByProvider.name }}</p>
            </template>
            <template #workspace>
                <div>
                    <p-field-title label="Workspace Mapping"
                                   size="md"
                                   class="mb-1"
                    />
                    <div class="flex flex-col gap-1">
                        <p-radio v-for="option in state.additionalOptionUiByProvider.workspaceMappingOptions"
                                 :key="option.value"
                                 v-model="state.workspaceMapping"
                                 :value="option.value"
                        >
                            {{ `${option.label} ➔ ${option.value === 'multipleWorkspaces' ? 'Multiple workspaces' : 'Single Workspace'}` }}
                        </p-radio>
                    </div>
                    <div>
                        <workspace-dropdown :disabled="state.workspaceMapping !== 'singleWorkspace'"
                                            :selected="state.selectedWorkspace"
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
                        <p-radio v-for="option in state.additionalOptionUiByProvider.projectGroupMappingOptions"
                                 :key="option.value"
                                 v-model="state.projectGroupMapping"
                                 :value="option.value"
                        >
                            {{ `${option.label} ➔ ${option.value === 'projectGroups' ? 'Project Groups' : 'Skip'}` }}
                        </p-radio>
                        <p-radio v-model="state.projectGroupMapping"
                                 value="skip"
                        >
                            {{ $t('Skip project group mapping') }}
                        </p-radio>
                    </div>
                </div>
            </template>
        </mapping-method>
    </div>
</template>

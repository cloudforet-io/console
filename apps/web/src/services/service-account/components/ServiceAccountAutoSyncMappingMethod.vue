<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { PFieldTitle, PRadio } from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import WorkspaceDropdown from '@/services/service-account/components/WorkspaceDropdown.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

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

const props = withDefaults(defineProps<{mode:'UPDATE'|'READ'}>(), {
    mode: 'UPDATE',
});

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const serviceAccountPageFormState = serviceAccountPageStore.formState;
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    selectedWorkspace: computed(() => serviceAccountPageStore.formState.selectedSingleWorkspace ?? ''),
    additionalOptionUiByProvider: computed(() => cspAdditionalOptionMap[serviceAccountPageState.selectedProvider] ?? {}),
    workspaceMapping: 'multipleWorkspaces',
    projectGroupMapping: 'projectGroups',
    selectedWorkspaceItem: computed(() => userWorkspaceStore.getters.workspaceMap[state.selectedWorkspace] ?? {}),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isResourceGroupDomain: computed(() => serviceAccountPageState.originServiceAccountItem.resource_group === 'DOMAIN'),
    isCreatePage: computed(() => serviceAccountPageState.originServiceAccountItem?.resource_group === undefined),
    isDomainForm: computed(() => (state.isCreatePage ? state.isAdminMode : state.isResourceGroupDomain)),
    mappingItems: computed(() => (state.isDomainForm ? [
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
    ] : [
        {
            icon: 'ic_document-filled',
            name: 'project_group',
        },
    ])),
    formData: computed(() => (state.isDomainForm ? {
        selectedSingleWorkspace: state.workspaceMapping === 'singleWorkspace' ? state.selectedWorkspace : '',
        skipProjectGroup: state.projectGroupMapping === 'skip',
    } : {
        skipProjectGroup: state.projectGroupMapping === 'skip',
    })),
    selectedWorkspaceMappingOptionLabel: computed(() => cspAdditionalOptionMap[serviceAccountPageState.selectedProvider].workspaceMappingOptions
        .find((option) => (option.value === (state.selectedWorkspace ? 'singleWorkspace' : 'multipleWorkspaces')))?.label),
    selectedProjectGroupMappingOptionLabel: computed(() => cspAdditionalOptionMap[serviceAccountPageState.selectedProvider].projectGroupMappingOptions[0].label),
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

watch(() => serviceAccountPageState.originServiceAccountItem, (item) => {
    if (item) {
        state.workspaceMapping = item.sync_options?.single_workspace_id ? 'singleWorkspace' : 'multipleWorkspaces';
        state.projectGroupMapping = item.sync_options?.skip_project_group ? 'skip' : 'projectGroups';
    }
}, { immediate: true });

</script>

<template>
    <div class="service-account-auto-sync-mapping-method">
        <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.MAPPING_METHOD')"
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
                    <div v-if="props.mode === 'UPDATE'">
                        <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.WORKSPACE_MAPPING')"
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
                    <div v-else>
                        <div class="flex gap-1 flex-wrap items-center">
                            <span>{{ state.selectedWorkspaceMappingOptionLabel }} ➔</span>
                            <div v-if="state.selectedWorkspace"
                                 class="flex gap-1"
                            >
                                <workspace-logo-icon :text="state.selectedWorkspaceItem?.name || ''"
                                                     :theme="state.selectedWorkspaceItem?.tags?.theme"
                                                     size="xs"
                                />
                                <span class="workspace-name">{{ state.selectedWorkspaceItem?.name }}</span>
                            </div>
                            <div v-else>
                                Multiple workspaces
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #project_group>
                <div v-if="props.mode === 'UPDATE'">
                    <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.PROJECT_GROUP_MAPPING')"
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
                            {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SKIP_PROJECT_GROUP_MAPPING') }}
                        </p-radio>
                    </div>
                </div>
                <div v-else>
                    {{ serviceAccountPageFormState.skipProjectGroup ? $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SKIP_PROJECT_GROUP_MAPPING') : state.selectedProjectGroupMappingOptionLabel }}
                </div>
            </template>
        </mapping-method>
    </div>
</template>

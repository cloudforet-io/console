<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { PFieldTitle, PRadio } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import WorkspaceDropdown from '@/services/service-account/components/WorkspaceDropdown.vue';
import { CSP_AUTO_SYNC_OPTIONS_MAP, WORKSPACE_MAPPING_OPTIONS_MAP } from '@/services/service-account/constants/auto-sync-options-contant';
import type { ServiceAccountStoreFormState } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

type FormData = Partial<Pick<ServiceAccountStoreFormState, 'selectedSingleWorkspace' | 'skipProjectGroup' | 'useManagementGroupAsWorkspace'>>;
const props = withDefaults(defineProps<{mode:'UPDATE'|'READ'}>(), {
    mode: 'UPDATE',
});

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const serviceAccountPageFormState = serviceAccountPageStore.formState;
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    selectedWorkspace: computed<string|undefined>(() => serviceAccountPageStore.formState.selectedSingleWorkspace ?? undefined),
    additionalOptionUiByProvider: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider] ?? {}),
    workspaceMappingOptions: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].workspaceMappingOptions),
    projectGroupMappingOptions: computed(() => [
        ...CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].projectGroupMappingOptions,
        {
            label: i18n.t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SKIP_PROJECT_GROUP_MAPPING'),
            value: false,
        },
    ]),
    workspaceMapping: 'multi',
    projectGroupMapping: true,

    formData: computed<FormData>(() => (state.isDomainForm ? {
        selectedSingleWorkspace: state.workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE ? state.selectedWorkspace : undefined,
        skipProjectGroup: !state.projectGroupMapping,
        useManagementGroupAsWorkspace: state.workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.MULTI_MANAGEMENT_GROUP_FOR_AZURE ? true : undefined,
    } : {
        skipProjectGroup: !state.projectGroupMapping,
    })),

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
    selectedWorkspaceMappingOptionLabel: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].workspaceMappingOptions
        .find((option) => (option.value === state.workspaceMapping))?.label),
    selectedProjectGroupMappingOptionLabel: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].projectGroupMappingOptions[0].label),
});

const handleUpdateWorkspace = (workspaceId:string) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.selectedSingleWorkspace = workspaceId;
    });
};

const handleWorkspaceMappingChange = (value: (typeof WORKSPACE_MAPPING_OPTIONS_MAP)[keyof typeof WORKSPACE_MAPPING_OPTIONS_MAP]) => {
    state.workspaceMapping = value;
};

const handleProjectGroupMappingChange = (value: boolean) => {
    state.projectGroupMapping = value;
};

watch(() => state.formData, (formData) => {
    Object.entries(formData).forEach(([key, value]) => {
        serviceAccountPageStore.setFormState(key, value);
    });
});

watch(() => serviceAccountPageState.originServiceAccountItem, (item) => {
    if (item) {
        if (!item.sync_options?.single_workspace_id && !item.sync_options?.use_management_group_as_workspace) { // normal multi workspace case
            state.workspaceMapping = WORKSPACE_MAPPING_OPTIONS_MAP.MULTI;
        } else if (item.sync_options?.use_management_group_as_workspace) { // Azure multi management group workspace case
            state.workspaceMapping = WORKSPACE_MAPPING_OPTIONS_MAP.MULTI_MANAGEMENT_GROUP_FOR_AZURE;
        } else { // normal single workspace case
            state.workspaceMapping = WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE;
        }
        state.selectedWorkspace = item.sync_options?.single_workspace_id ?? undefined;
        state.projectGroupMapping = !item.sync_options?.skip_project_group;
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
                            <p-radio v-for="option in state.workspaceMappingOptions"
                                     :key="option.value"
                                     :value="option.value"
                                     :selected="state.workspaceMapping"
                                     @change="handleWorkspaceMappingChange"
                            >
                                {{ `${option.label} ➔ ${(option.value === WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE) ?
                                    'Single Workspace' : 'Multiple Workspaces'}` }}
                            </p-radio>
                        </div>
                        <div>
                            <workspace-dropdown v-if="state.workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE"
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
                        <p-radio v-for="option in state.projectGroupMappingOptions"
                                 :key="option.value"
                                 :value="option.value"
                                 :selected="state.projectGroupMapping"
                                 @change="handleProjectGroupMappingChange"
                        >
                            {{ `${option.label} ➔ ${option.value === false ? 'Skip' : 'Project Groups'}` }}
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

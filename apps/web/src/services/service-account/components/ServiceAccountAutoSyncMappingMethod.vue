<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { PFieldTitle, PRadio } from '@cloudforet/mirinae';


import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import InfoTooltip from '@/common/components/info-tooltip/InfoTooltip.vue';
import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';
import type { MappingItem } from '@/common/components/mapping-method/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import WorkspaceDropdown from '@/services/service-account/components/WorkspaceDropdown.vue';
import { CSP_AUTO_SYNC_OPTIONS_MAP, WORKSPACE_MAPPING_OPTIONS_MAP } from '@/services/service-account/constants/auto-sync-options-contant';
import type { ServiceAccountStoreFormState } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

type FormData = Partial<Pick<ServiceAccountStoreFormState, 'selectedSingleWorkspace' | 'skipProjectGroup' | 'azureManagementGroupMappingType'>>;
type MappingMethodOptionType = {
    label: string;
    value: any;
    info?: string;
};

type WorkspaceMapping = (typeof WORKSPACE_MAPPING_OPTIONS_MAP)[keyof typeof WORKSPACE_MAPPING_OPTIONS_MAP];

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
    mappingMethodProviderLabel: computed<string|undefined>(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider]?.name ?? ''),
    workspaceMappingOptions: computed<MappingMethodOptionType[]>(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].workspaceMappingOptions),
    projectGroupMappingOptions: computed<MappingMethodOptionType[]>(() => [
        ...CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].projectGroupMappingOptions,
        {
            label: i18n.t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SKIP_PROJECT_GROUP_MAPPING'),
            value: false,
        },
    ]),
    workspaceMapping: 'multi' as WorkspaceMapping,
    projectGroupMappingDisabled: computed<boolean>(() => serviceAccountPageState.selectedProvider === 'azure'
    && state.workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.LEAF_AZURE_MANAGEMENT_GROUP_MAPPING),
    projectGroupMapping: true as boolean,

    formData: computed<FormData>(() => convertToMappingMethodDTO(state.isDomainForm, state.workspaceMapping, state.projectGroupMapping, state.selectedWorkspace)),
    selectedWorkspaceItem: computed(() => userWorkspaceStore.getters.workspaceMap[state.selectedWorkspace] ?? {}),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isResourceGroupDomain: computed(() => serviceAccountPageState.originServiceAccountItem.resource_group === 'DOMAIN'),
    isCreatePage: computed(() => serviceAccountPageState.originServiceAccountItem?.resource_group === undefined),
    isDomainForm: computed(() => (state.isCreatePage ? state.isAdminMode : state.isResourceGroupDomain)),
    mappingItems: computed<MappingItem[]>(() => {
        if (state.isDomainForm) {
            return [
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
            ].filter((item) => (state.projectGroupMappingDisabled ? item.name !== 'project_group' : true));
        }
        return [
            {
                icon: 'ic_document-filled',
                name: 'project_group',
            },
        ];
    }),
    selectedWorkspaceMappingOptionLabel: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].workspaceMappingOptions
        .find((option) => (option.value === state.workspaceMapping))?.label),
    selectedProjectGroupMappingOptionLabel: computed(() => CSP_AUTO_SYNC_OPTIONS_MAP[serviceAccountPageState.selectedProvider].projectGroupMappingOptions[0].label),
});


/* Utils */
/*
* This functions are used to convert the mapping method form data to the service account form data.
* And also, convert the service account form data to the mapping method form data.
*
* 1. convertToMappingMethodDTO
* 2. convertToMappingMethodClientEntity
*
* Azure Account has additional mapping method options (Top Node Management Group, Leaf Node Management Group).
*/
const convertToMappingMethodDTO = (isDomainForm: boolean, workspaceMapping: WorkspaceMapping, projectGroupMapping: boolean, selectedWorkspace: string) => {
    // In Workspace Tenant
    if (!isDomainForm) {
        return {
            skipProjectGroup: !projectGroupMapping,
        };
    }
    // In Admin Mode : Multi Workspace
    if (workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.MULTI) {
        return {
            azureManagementGroupMappingType: undefined,
            skipProjectGroup: !projectGroupMapping,
            selectedSingleWorkspace: undefined,
        };
    }
    // In Admin Mode : Single Workspace
    if (workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE) {
        return {
            skipProjectGroup: !projectGroupMapping,
            azureManagementGroupMappingType: undefined,
            selectedSingleWorkspace: selectedWorkspace,
        };
    }
    // In Admin Mode : (Only Azure) Top Node Management Group
    if (workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.TOP_AZURE_MANAGEMENT_GROUP_MAPPING) {
        return {
            skipProjectGroup: !projectGroupMapping,
            azureManagementGroupMappingType: workspaceMapping,
            selectedSingleWorkspace: undefined,
        };
    }
    // In Admin Mode : (Only Azure) Leaf Node Management Group
    if (workspaceMapping === WORKSPACE_MAPPING_OPTIONS_MAP.LEAF_AZURE_MANAGEMENT_GROUP_MAPPING) {
        return {
            skipProjectGroup: !projectGroupMapping,
            azureManagementGroupMappingType: workspaceMapping,
            selectedSingleWorkspace: undefined,
        };
    }
    // default
    return {
        skipProjectGroup: !projectGroupMapping,
        selectedSingleWorkspace: undefined,
        azureManagementGroupMappingType: undefined,
    };
};
const convertToMappingMethodClientEntity = (originServiceAccountItem: TrustedAccountModel) => {
    const skipProjectGroup = originServiceAccountItem.sync_options?.skip_project_group;
    const singleWorkspaceId = originServiceAccountItem.sync_options?.single_workspace_id;
    const azureManagementGroupMappingType = originServiceAccountItem.sync_options?.azure_management_group_mapping_type;

    // Multi Workspace
    if (!singleWorkspaceId && !azureManagementGroupMappingType) {
        state.workspaceMapping = WORKSPACE_MAPPING_OPTIONS_MAP.MULTI;
        state.projectGroupMapping = !skipProjectGroup;
    // Azure Multi Management Group Workspace
    } else if (azureManagementGroupMappingType) {
        state.workspaceMapping = azureManagementGroupMappingType;
        state.projectGroupMapping = azureManagementGroupMappingType === WORKSPACE_MAPPING_OPTIONS_MAP.LEAF_AZURE_MANAGEMENT_GROUP_MAPPING ? true : !skipProjectGroup;
    // Single Workspace
    } else if (singleWorkspaceId) {
        state.workspaceMapping = WORKSPACE_MAPPING_OPTIONS_MAP.SINGLE;
        state.projectGroupMapping = !skipProjectGroup;
    // Default (Workspace Tenant)
    } else {
        state.projectGroupMapping = !skipProjectGroup;
    }
};



/* Event */
const handleUpdateWorkspace = (workspaceId:string) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.selectedSingleWorkspace = workspaceId;
    });
};

const handleWorkspaceMappingChange = (value: WorkspaceMapping) => {
    state.workspaceMapping = value;
    if (value === WORKSPACE_MAPPING_OPTIONS_MAP.LEAF_AZURE_MANAGEMENT_GROUP_MAPPING) state.projectGroupMapping = false;
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
        const _item = item as TrustedAccountModel;
        convertToMappingMethodClientEntity(_item);
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
                <p>{{ state.mappingMethodProviderLabel }}</p>
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
                                <info-tooltip v-if="option.info"
                                              :tooltip-contents="option.info"
                                              width="0.875rem"
                                              height="0.875rem"
                                />
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

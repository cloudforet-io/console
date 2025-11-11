<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import {
    PFieldTitle, PRadio, PTextInput, PPaneLayout, PFieldGroup,
} from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import MappingMethod from '@/common/components/mapping-method/MappingMethod.vue';
import type { MappingItem } from '@/common/components/mapping-method/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import WorkspaceDropdown from '@/services/asset-inventory/components/WorkspaceDropdown.vue';
import {
    WORKSPACE_MAPPING_OPTIONS,
    PROJECT_GROUP_MAPPING_OPTIONS,
    CSP_ORGANIZATION_TERMS,
    WORKSPACE_MAPPING_TYPE,
    PROJECT_GROUP_MAPPING_TYPE,
} from '@/services/asset-inventory/constants/service-account-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import {
    type WorkspaceMappingType,
    type ProjectGroupMappingType,
    CUSTOM_DEPTH_MAX_DEPTH,
} from '@/services/asset-inventory/types/service-account-page-type';

const CUSTOM_DEPTH = 'Custom Depth';

const props = withDefaults(defineProps<{mode:'UPDATE'|'READ'}>(), {
    mode: 'UPDATE',
});

const emit = defineEmits<{(event: 'update:is-valid', value: boolean): void;
}>();

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    selectedWorkspace: computed({
        get: () => serviceAccountPageStore.formState.selectedSingleWorkspace ?? '',
        set: (value: string) => {
            serviceAccountPageStore.$patch((_state) => {
                _state.formState.selectedSingleWorkspace = value;
            });
        },
    }),
    organizationTerms: computed<{ name: string; group: string }>(() => CSP_ORGANIZATION_TERMS[serviceAccountPageState.selectedProvider] ?? {}),
    workspaceMapping: WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE as WorkspaceMappingType,
    projectGroupMapping: PROJECT_GROUP_MAPPING_TYPE.SKIP as ProjectGroupMappingType,
    customDepth: null,
    selectedWorkspaceItem: computed(() => userWorkspaceStore.getters.workspaceMap[state.selectedWorkspace] ?? {}),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isResourceGroupDomain: computed(() => serviceAccountPageState.originServiceAccountItem.resource_group === 'DOMAIN'),
    isCreatePage: computed(() => serviceAccountPageState.originServiceAccountItem?.resource_group === undefined),
    isDomainForm: computed(() => (state.isCreatePage ? state.isAdminMode : state.isResourceGroupDomain)),
    mappingItems: computed<MappingItem[]>(() => {
        const baseItems = state.isDomainForm ? [
            {
                imageUrl: serviceAccountPageStore.getters.selectedProviderItem?.icon,
                name: 'provider',
            },
            {
                icon: 'ic_workspaces',
                name: 'workspace',
            },
        ] : [];

        // Leaf-Level Groups 선택 시: not_possible_project_group 아이콘 표시
        if (state.workspaceMapping === WORKSPACE_MAPPING_TYPE.LEAF_LEVEL_GROUPS) {
            return [
                ...baseItems,
                {
                    icon: 'ic_limit-filled',
                    name: 'not_possible_project_group',
                },
            ];
        }

        // 다른 경우: 일반 project_group 아이콘 표시
        return [
            ...baseItems,
            {
                icon: 'ic_document-filled',
                name: 'project_group',
            },
        ];
    }),
    formData: computed(() => (state.isDomainForm ? {
        workspaceMappingType: state.workspaceMapping,
        projectGroupMappingType: state.projectGroupMapping,
        customDepth: state.workspaceMapping === WORKSPACE_MAPPING_TYPE.CUSTOM_DEPTH_GROUPS ? state.customDepth : undefined,
        selectedSingleWorkspace: state.workspaceMapping === WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE ? state.selectedWorkspace : '',
    } : {
        projectGroupMappingType: state.projectGroupMapping,
    })),
    selectedWorkspaceMappingOptionLabel: computed<string>(() => {
        const option = WORKSPACE_MAPPING_OPTIONS.find((opt) => opt.value === state.workspaceMapping);
        if (!option) return '';
        return option.target ? `${option.name} ➔ ${option.target}` : option.name;
    }),
    selectedProjectGroupMappingOptionLabel: computed<string>(() => {
        const option = PROJECT_GROUP_MAPPING_OPTIONS.find((opt) => opt.value === state.projectGroupMapping);
        if (!option) return '';
        return option.target ? `${option.name} ➔ ${option.target}` : option.name;
    }),
    customDepthMaxDepth: computed<number>(() => CUSTOM_DEPTH_MAX_DEPTH[serviceAccountPageState.selectedProvider]),
    customDepthInvalid: computed<boolean>(() => state.customDepth !== null && (state.customDepth < 1 || state.customDepth > state.customDepthMaxDepth)),
    // Validation states
    isWorkspaceMappingValid: computed<boolean>(() => {
        if (state.workspaceMapping === WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE) {
            return !!state.selectedWorkspace;
        }
        return true;
    }),
    isProjectGroupMappingValid: computed<boolean>(() => {
        if (state.workspaceMapping === WORKSPACE_MAPPING_TYPE.CUSTOM_DEPTH_GROUPS) {
            return !state.customDepthInvalid && state.customDepth !== null;
        }
        return true;
    }),
    isMappingMethodValid: computed<boolean>(() => {
        if (!state.isDomainForm) return true;
        return state.isWorkspaceMappingValid && state.isProjectGroupMappingValid;
    }),
});

const handleUpdateWorkspace = (workspaceId:string) => {
    state.selectedWorkspace = workspaceId;
};

watch(() => state.formData, (formData) => {
    Object.entries(formData).forEach(([key, value]) => {
        serviceAccountPageStore.setFormState(key, value);
    });
});

// Initialize from store formState (for CREATE mode) or originServiceAccountItem (for UPDATE mode)
watch(() => serviceAccountPageState.originServiceAccountItem, (item) => {
    if (item) {
        state.workspaceMapping = item.sync_options?.workspace_mapping_type ?? WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE;
        state.projectGroupMapping = item.sync_options?.project_group_mapping_type ?? PROJECT_GROUP_MAPPING_TYPE.NESTED_SUB_GROUPS;
        state.customDepth = item.sync_options?.custom_depth ?? null;
    }
}, { immediate: true });

// Sync workspaceMapping from formState on mount (for cases where store is already populated)
watch(() => serviceAccountPageStore.formState.workspaceMappingType, (newType) => {
    if (newType && newType !== state.workspaceMapping) {
        state.workspaceMapping = newType;
    }
}, { immediate: true });

// Sync projectGroupMapping from formState on mount
watch(() => serviceAccountPageStore.formState.projectGroupMappingType, (newType) => {
    if (newType && newType !== state.projectGroupMapping) {
        state.projectGroupMapping = newType;
    }
}, { immediate: true });

// Sync customDepth from formState on mount
watch(() => serviceAccountPageStore.formState.customDepth, (newDepth) => {
    if (newDepth !== undefined && newDepth !== state.customDepth) {
        state.customDepth = newDepth;
    }
}, { immediate: true });

// Emit validation state whenever any validation-related state changes
watch(() => state.isMappingMethodValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

// Watch individual validation dependencies to ensure reactivity
watch(() => state.selectedWorkspace, () => {
    emit('update:is-valid', state.isMappingMethodValid);
});

watch(() => state.workspaceMapping, () => {
    emit('update:is-valid', state.isMappingMethodValid);
});

watch(() => state.customDepth, () => {
    emit('update:is-valid', state.isMappingMethodValid);
});

watch(() => state.projectGroupMapping, () => {
    emit('update:is-valid', state.isMappingMethodValid);
});

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
                <p>{{ state.organizationTerms.name }}</p>
            </template>
            <template #workspace>
                <div>
                    <div v-if="props.mode === 'UPDATE'">
                        <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.WORKSPACE_MAPPING')"
                                       size="md"
                                       class="mb-1"
                        />

                        <div class="flex flex-col gap-2">
                            <div v-for="option in WORKSPACE_MAPPING_OPTIONS"
                                 :key="option.value"
                            >
                                <p-radio v-model="state.workspaceMapping"
                                         :value="option.value"
                                         class="flex items-center gap-1"
                                >
                                    <span class="font-normal">{{ option.name }}</span>
                                    <span v-if="option.target"
                                          class="font-medium"
                                    > ➔ {{ option.target }}</span>
                                </p-radio>

                                <!-- ALL_GROUPS_SINGLE_WORKSPACE: Workspace Dropdown -->
                                <div v-if="state.workspaceMapping === option.value && option.value === WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE"
                                     class="mt-2 ml-6"
                                >
                                    <p-pane-layout class="p-4 flex flex-col gap-1">
                                        <span class="text-xs font-medium text-gray-600">{{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.WORKSPACE_NAME') }}</span>
                                        <workspace-dropdown :selected="state.selectedWorkspace"
                                                            @update="handleUpdateWorkspace"
                                        />
                                    </p-pane-layout>
                                </div>


                                <!-- CUSTOM_DEPTH_GROUPS: Depth 입력 -->
                                <div v-if="state.workspaceMapping === option.value && option.value === WORKSPACE_MAPPING_TYPE.CUSTOM_DEPTH_GROUPS"
                                     class="mt-2 ml-6"
                                >
                                    <p-pane-layout class="p-4 flex flex-col gap-2">
                                        <p class="flex flex-col gap-1 text-xs">
                                            <span class="font-bold text-gray-600">{{ CUSTOM_DEPTH }}</span>
                                            <span>{{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.CUSTOM_DEPTH_DESCRIPTION',
                                                        { csp_max_depth: CUSTOM_DEPTH_MAX_DEPTH[serviceAccountPageState.selectedProvider] }) }}</span>
                                        </p>
                                        <p-field-group :invalid="state.customDepthInvalid"
                                                       :invalid-text="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.CUSTOM_DEPTH_INVALID', {
                                                           csp_max_depth: state.customDepthMaxDepth
                                                       })"
                                                       required
                                        >
                                            <p-text-input
                                                v-model.number="state.customDepth"
                                                type="number"
                                                min="1"
                                                :max="state.customDepthMaxDepth"
                                                :invalid="state.customDepth !== null && (state.customDepth < 1 || state.customDepth > state.customDepthMaxDepth)"
                                                placeholder="Enter depth"
                                            />
                                        </p-field-group>
                                    </p-pane-layout>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div class="flex gap-1 flex-wrap items-center">
                            <!-- All Groups → workspace name -->
                            <template v-if="state.workspaceMapping === WORKSPACE_MAPPING_TYPE.ALL_GROUPS_SINGLE_WORKSPACE && state.selectedWorkspace">
                                <span>All Groups ➔</span>
                                <workspace-logo-icon :text="state.selectedWorkspaceItem?.name || ''"
                                                     :theme="state.selectedWorkspaceItem?.tags?.theme"
                                                     size="xs"
                                />
                                <span class="workspace-name">{{ state.selectedWorkspaceItem?.name }}</span>
                            </template>
                            <!-- Custom Depth Groups → Multiple workspaces -->
                            <template v-else-if="state.workspaceMapping === WORKSPACE_MAPPING_TYPE.CUSTOM_DEPTH_GROUPS && state.customDepth">
                                <span>Groups of {{ state.customDepth }} depth ➔ Multiple workspaces</span>
                            </template>
                            <!-- Other cases: use label as is -->
                            <template v-else>
                                <span>{{ state.selectedWorkspaceMappingOptionLabel }}</span>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
            <template #not_possible_project_group>
                <div v-if="props.mode === 'UPDATE'">
                    <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.PROJECT_GROUP_MAPPING_NOT_POSSIBLE')"
                                   size="md"
                                   class="mb-1"
                    />
                    <p class="text-xs text-gray-900">
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.LEAF_LEVEL_DESCRIPTION') }}
                    </p>
                </div>
                <div v-else>
                    <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.PROJECT_GROUP_MAPPING_NOT_POSSIBLE')"
                                   size="md"
                                   class="mb-1"
                    />
                    <p class="text-xs text-gray-900">
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.LEAF_LEVEL_DESCRIPTION') }}
                    </p>
                </div>
            </template>
            <template #project_group>
                <div v-if="props.mode === 'UPDATE'">
                    <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.PROJECT_GROUP_MAPPING')"
                                   size="md"
                                   class="mb-1"
                    />
                    <div class="flex flex-col gap-2">
                        <div v-for="option in PROJECT_GROUP_MAPPING_OPTIONS"
                             :key="option.value"
                        >
                            <p-radio v-model="state.projectGroupMapping"
                                     :value="option.value"
                                     class="flex items-center gap-1"
                            >
                                <span class="font-normal">{{ option.name }}</span>
                                <span v-if="option.target"
                                      class="font-medium"
                                > ➔ {{ option.target }}</span>
                            </p-radio>
                        </div>
                    </div>
                </div>
                <div v-else>
                    {{ state.selectedProjectGroupMappingOptionLabel }}
                </div>
            </template>
        </mapping-method>
    </div>
</template>

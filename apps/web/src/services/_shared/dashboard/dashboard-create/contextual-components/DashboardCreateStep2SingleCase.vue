<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PI, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type {
    DashboardCreateParams, DashboardFolderModel, DashboardModel, DashboardType,
} from '@/api-clients/dashboard/_types/dashboard-type';
import { usePrivateDashboardApi } from '@/api-clients/dashboard/private-dashboard/composables/use-private-dashboard-api';
import type {
    PrivateDashboardCreateParameters,
} from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import { usePublicDashboardApi } from '@/api-clients/dashboard/public-dashboard/composables/use-public-dashboard-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardSharedContext } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-shared-context';
import DashboardCreateScopeForm from '@/services/_shared/dashboard/dashboard-create/contextual-components/DashboardCreateScopeForm.vue';
import { useDashboardCreatePageStore } from '@/services/_shared/dashboard/dashboard-create/stores/dashboard-create-page-store';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-vars-schema-preset';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Props {
    isValid: boolean;
    dashboardItems: Array<DashboardModel>;
    folderItems: Array<DashboardFolderModel>;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void
}>();

const router = useRouter();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;
const userStore = useUserStore();
const {
    isAdminMode, entryPoint, projectGroupOrProjectId, projectContextType,
} = useDashboardSharedContext();

const getDashboardNameList = (dashboardType: DashboardType) => {
    if (dashboardType === 'PRIVATE') {
        return props.dashboardItems.filter((i) => i.dashboard_id.startsWith('private')).map((item) => item.name);
    }
    return props.dashboardItems.filter((i) => i.dashboard_id.startsWith('public')).map((item) => item.name);
};

const state = reactive({
    proxyIsValid: useProxyValue('isValid', props, emit),
    publicFolderItems: computed(() => props.folderItems.filter((i) => i.folder_id.startsWith('public'))),
    privateFolderItems: computed(() => props.folderItems.filter((i) => i.folder_id.startsWith('private'))),
    dashboardNameList: computed<string[]>(() => getDashboardNameList(dashboardCreatePageGetters.dashboardType)),
    labels: [] as InputItem[],
    folderMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const defaultItem = {
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER'),
            name: '',
        };
        if (dashboardCreatePageState.dashboardScope === 'PRIVATE') {
            return [
                defaultItem,
                ...state.privateFolderItems.map((folder) => ({
                    label: folder.name,
                    name: folder.folder_id,
                })),
            ];
        }
        if (entryPoint.value === 'PROJECT') {
            return [
                defaultItem,
                ...state.publicFolderItems.filter((folder) => {
                    if (projectContextType.value === 'PROJECT') {
                        return folder.project_id === projectGroupOrProjectId.value;
                    }
                    if (projectContextType.value === 'PROJECT_GROUP') {
                        return folder.project_group_id === projectGroupOrProjectId.value;
                    }
                    return false;
                }).map((folder) => ({
                    label: folder.name,
                    name: folder.folder_id,
                })),
            ];
        }
        return [
            defaultItem,
            ...state.publicFolderItems.map((folder) => ({
                label: folder.name,
                name: folder.folder_id,
            })),
        ];
    }),
    selectedFolderId: '' as string,
});
const {
    forms: {
        dashboardName,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    dashboardName: '',
}, {
    dashboardName(value: string) {
        if (dashboardCreatePageState.loading || dashboardCreatePageState.dashboardCreated) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

/* Api */
const queryClient = useQueryClient();
const { publicDashboardAPI } = usePublicDashboardApi();
const { privateDashboardAPI } = usePrivateDashboardApi();
const { key: publicDashboardListQueryKey } = useServiceQueryKey('dashboard', 'public-dashboard', 'list');
const { key: privateDashboardListQueryKey } = useServiceQueryKey('dashboard', 'private-dashboard', 'list');

const createDashboardFn = (params: DashboardCreateParams): Promise<DashboardModel> => {
    if (dashboardCreatePageState.dashboardScope === 'PRIVATE') {
        return privateDashboardAPI.create(params as PrivateDashboardCreateParameters);
    }
    return publicDashboardAPI.create(params as PublicDashboardCreateParameters);
};

const { mutate: createDashboard } = useMutation(
    {
        mutationFn: createDashboardFn,
        onSuccess: (dashboard: DashboardModel) => {
            dashboardCreatePageStore.setDashboardCreated(true);
            const isPrivate = dashboard.dashboard_id.startsWith('private');
            const dashboardListQueryKey = isPrivate ? privateDashboardListQueryKey : publicDashboardListQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
        },
        onError: (e) => {
            showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'), e);
        },
        onSettled(data) {
            if (data?.dashboard_id) {
                if (entryPoint.value === 'DASHBOARDS') {
                    if (isAdminMode.value) {
                        router.push({
                            name: ADMIN_DASHBOARDS_ROUTE._NAME,
                            params: { dashboardId: data.dashboard_id },
                        }).catch(() => {});
                    } else {
                        router.push({
                            name: DASHBOARDS_ROUTE._NAME,
                            params: { dashboardId: data.dashboard_id },
                        }).catch(() => {});
                    }
                } else if (entryPoint.value === 'PROJECT') {
                    if (!projectGroupOrProjectId.value) {
                        console.error('projectGroupOrProjectId is not provided');
                        return;
                    }
                    router.push({
                        name: PROJECT_ROUTE_V2._NAME,
                        params: {
                            projectGroupOrProjectId: projectGroupOrProjectId.value,
                            dashboardId: data.dashboard_id,
                        },
                    }).catch(() => {});
                } else {
                    console.error('Invalid entry point');
                }
            }
        },
    },
);

/* Event */
const handleConfirm = async () => {
    dashboardCreatePageStore.setLoading(true);
    const _dashboardParams: DashboardCreateParams = {
        name: dashboardName.value,
        labels: state.labels.map((item) => item.name),
        tags: { created_by: userStore.state.userId },
        folder_id: state.selectedFolderId,
        vars_schema: DASHBOARD_VARS_SCHEMA_PRESET,
    };

    if (entryPoint.value === 'DASHBOARDS') {
        if (isAdminMode.value) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (dashboardCreatePageState.dashboardScope !== 'PRIVATE') {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = dashboardCreatePageState.dashboardScope || RESOURCE_GROUP.WORKSPACE;
        }
    } else if (entryPoint.value === 'PROJECT' && projectContextType.value === 'PROJECT') {
        (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.PROJECT;
        (_dashboardParams as PublicDashboardCreateParameters).project_id = projectGroupOrProjectId.value;
    } else if (entryPoint.value === 'PROJECT' && projectContextType.value === 'PROJECT_GROUP') {
        (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
        (_dashboardParams as PublicDashboardCreateParameters).project_group_id = projectGroupOrProjectId.value;
    }

    createDashboard(_dashboardParams as DashboardCreateParams);
};

/* Watcher */
watch(() => isAllValid.value, (value) => {
    emit('update:is-valid', value);
});

/* Expose */
defineExpose({
    handleConfirm,
});
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="left-part flex items-center gap-4">
            <div>
                <p-i name="ic_dashboard-template_blank"
                     width="3.5rem"
                     height="3.5rem"
                />
            </div>
            <div>
                <div class="board-item-title">
                    Blank
                </div>
                <div class="label-wrapper">
                    <span class="blank-description">
                        {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}
                    </span>
                </div>
            </div>
        </div>
        <div class="input-form-wrapper">
            <p-field-group :label="$t('DASHBOARDS.CREATE.NAME')"
                           required
                           :invalid="invalidState.dashboardName"
                           :invalid-text="invalidTexts.dashboardName"
            >
                <template #default="{invalid}">
                    <p-text-input :value="dashboardName"
                                  :invalid="invalid"
                                  block
                                  @update:value="setForm('dashboardName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.CREATE.LABEL')">
                <p-text-input multi-input
                              appearance-type="stack"
                              :selected.sync="state.labels"
                              block
                />
            </p-field-group>
            <dashboard-create-scope-form />
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.LOCATION')"
                           required
                           class="mt-4"
            >
                <p-select-dropdown :selected.sync="state.selectedFolderId"
                                   :menu="state.folderMenuItems"
                                   block
                                   show-select-marker
                                   use-fixed-menu-style
                                   class="w-full"
                >
                    <template #menu-item--format="{item}">
                        <p-i v-if="item.name"
                             name="ic_folder"
                             width="1rem"
                             height="1rem"
                        />
                        {{ item.label }}
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.board-item-title {
    @apply text-label-lg text-gray-900;
    margin-bottom: 0.375rem;
}
.blank-description {
    @apply text-paragraph-sm text-gray-500;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
    }
}
</style>

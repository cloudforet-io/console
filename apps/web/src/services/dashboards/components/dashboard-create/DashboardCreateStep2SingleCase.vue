<script lang="ts" setup>
import {
    computed, defineExpose, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PI, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardCreateParams, DashboardModel, DashboardType } from '@/api-clients/dashboard/_types/dashboard-type';
import type {
    PrivateDashboardCreateParameters,
} from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardCreateScopeForm from '@/services/dashboards/components/dashboard-create/DashboardCreateScopeForm.vue';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/dashboards/constants/dashboard-vars-schema-preset';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';

interface Props {
    isValid: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void
}>();

const router = useRouter();
const appContextStore = useAppContextStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;
const userStore = useUserStore();

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    keys,
    api,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
} = useDashboardFolderQuery();
const queryClient = useQueryClient();

const getDashboardNameList = (dashboardType: DashboardType) => {
    if (dashboardType === 'PRIVATE') {
        return (privateDashboardList.value.filter((i) => i.version !== '1.0')).map((item) => item.name);
    }
    return publicDashboardList.value.filter((i) => i.version !== '1.0').map((item) => item.name);
};

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyIsValid: useProxyValue('isValid', props, emit),
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed(() => privateFolderList.value),
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
const createDashboardFn = (params: DashboardCreateParams): Promise<DashboardModel> => {
    if (dashboardCreatePageState.dashboardScope === 'PRIVATE') {
        return api.privateDashboardAPI.create(params as PrivateDashboardCreateParameters);
    }
    return api.publicDashboardAPI.create(params as PublicDashboardCreateParameters);
};

const { mutate: createDashboard } = useMutation(
    {
        mutationFn: createDashboardFn,
        onSuccess: (dashboard: DashboardModel) => {
            dashboardCreatePageStore.setDashboardCreated(true);
            const isPrivate = dashboard.dashboard_id.startsWith('private');
            const dashboardListQueryKey = isPrivate ? keys.privateDashboardListQueryKey : keys.publicDashboardListQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
        },
        onError: (e) => {
            showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'), e);
        },
        onSettled(data) {
            if (data?.dashboard_id) {
                const dashboardDetailRouteName = storeState.isAdminMode
                    ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
                    : DASHBOARDS_ROUTE.DETAIL._NAME;
                router.push({
                    name: dashboardDetailRouteName,
                    params: { dashboardId: data.dashboard_id },
                }).catch(() => {});
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
    if (storeState.isAdminMode) {
        (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
    } else if (dashboardCreatePageState.dashboardScope !== 'PRIVATE') {
        (_dashboardParams as PublicDashboardCreateParameters).resource_group = dashboardCreatePageState.dashboardScope || RESOURCE_GROUP.WORKSPACE;
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
        <div class="selected-ootb-wrapper">
            <p-i name="ic_dashboard-template_others"
                 width="3.5rem"
                 height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    Blank
                </p>
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
            <dashboard-create-scope-form v-if="!storeState.isAdminMode" />
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

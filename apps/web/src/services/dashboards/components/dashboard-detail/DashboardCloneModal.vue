<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardCreateParams, DashboardModel, DashboardType } from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';



interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();
const { privateWidgetAPI } = usePrivateWidgetApi();
const { publicWidgetAPI } = usePublicWidgetApi();

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    keys,
    api,
    queryClient,
} = useDashboardQuery();

const router = useRouter();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) {
            return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        }
        return '';
    },
});
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed<boolean>(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    dashboardType: computed<DashboardType>(() => {
        if (state.isPrivate) return 'PRIVATE';
        return 'PUBLIC';
    }),
    isPrivate: true,
    targetDashboard: computed<DashboardModel>(() => [...state.publicDashboardItems, ...state.privateDashboardItems].find((item: DashboardModel) => item.dashboard_id === props.dashboardId)),
    dashboardNameList: computed<string[]>(() => {
        if (props.dashboardId.startsWith('private')) {
            return state.privateDashboardItems.map((item) => item.name);
        }
        return state.publicDashboardItems.map((item) => item.name);
    }),
});

/* Api */
const listDashboardWidgets = async (dashboardId: string): Promise<WidgetModel[]> => {
    try {
        const isPrivate = dashboardId.startsWith('private');
        const fetcher = isPrivate
            ? privateWidgetAPI.list
            : publicWidgetAPI.list;
        const res = await fetcher({
            dashboard_id: dashboardId,
        });
        return res.results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

/* Event */
const handleChangePrivate = (val: boolean) => {
    state.isPrivate = val;
};
const handleConfirm = async () => {
    if (!isAllValid) return;
    const _dashboardWidgets = await listDashboardWidgets(props.dashboardId);

    const _sharedLayouts = await getSharedDashboardLayouts(state.targetDashboard.layouts, _dashboardWidgets, storeState.costDataSource);
    const _sharedDashboard: DashboardCreateParams = {
        name: name.value,
        layouts: _sharedLayouts,
        options: state.targetDashboard.options || {},
        labels: state.targetDashboard.labels || [],
        tags: { created_by: userStore.state.userId },
        vars: state.targetDashboard.vars,
        vars_schema: state.targetDashboard.vars_schema,
    };
    if (storeState.isWorkspaceMember) {
        state.isPrivate = true;
    } else if (storeState.isAdminMode) {
        state.isPrivate = false;
        (_sharedDashboard as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
    } else if (!state.isPrivate) {
        (_sharedDashboard as PublicDashboardCreateParameters).resource_group = state.targetDashboard?.resource_group || RESOURCE_GROUP.WORKSPACE;
    }

    mutate(_sharedDashboard as PrivateDashboardCreateParameters);
};

const createDashboard = (params: DashboardCreateParams): Promise<DashboardModel> => {
    if (state.isPrivate) {
        return api.privateDashboardAPI.create(params as PrivateDashboardCreateParameters);
    }
    return api.publicDashboardAPI.create(params as PublicDashboardCreateParameters);
};

const { mutate, isPending: dashboardCloneLoading } = useMutation(
    {
        mutationFn: createDashboard,
        onSuccess: (dashboard: DashboardModel) => {
            const isPrivate = dashboard.dashboard_id.startsWith('private');
            const dashboardListQueryKey = isPrivate ? keys.privateDashboardListQueryKey : keys.publicDashboardListQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
        },
        onError: (e) => {
            showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CLONE_DASHBOARD'), e);
        },
        onSettled(data) {
            state.proxyVisible = false;
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

watch(() => props.visible, (visible) => {
    if (visible) {
        const _clonedName = getClonedName(state.dashboardNameList, state.targetDashboard.name);
        setForm('name', _clonedName);
    }
});
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.FORM.CLONE_TITLE')"
                    size="sm"
                    :disabled="!isAllValid"
                    :loading="dashboardCloneLoading"
                    class="dashboard-clone-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{ invalid }">
                    <p-text-input :value="name"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="storeState.isWorkspaceOwner"
                           :label="$t('DASHBOARDS.FORM.LABEL_MAKE_PRIVATE')"
                           required
                           class="mt-6"
            >
                <p-toggle-button :value="state.isPrivate"
                                 :disabled="dashboardCloneLoading"
                                 @change-toggle="handleChangePrivate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-clone-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>

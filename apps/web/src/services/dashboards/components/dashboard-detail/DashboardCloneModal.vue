<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';
import { getClonedName } from '@cloudforet/utils';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardCreateParams, DashboardModel, DashboardType } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardCloneMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-clone-mutation';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
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

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    keys,
} = useDashboardQuery();
const queryClient = useQueryClient();

const router = useRouter();
const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();

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
    isWorkspaceOwner: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
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


const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

/* Event */
const handleChangePrivate = (val: boolean) => {
    state.isPrivate = val;
};
const handleConfirm = async () => {
    if (!isAllValid) return;

    const _sharedDashboard: DashboardCreateParams = {
        name: name.value,
    };
    if (storeState.isWorkspaceMember) {
        state.isPrivate = true;
    } else if (storeState.isAdminMode) {
        state.isPrivate = false;
    }

    if (!state.isPrivate) {
        if (storeState.isAdminMode) {
            (_sharedDashboard as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else {
            (_sharedDashboard as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.WORKSPACE;
        }
    }

    cloneDashboard(_sharedDashboard as DashboardCreateParams, props.dashboardId);
};

const { mutate: cloneDashboard, isPending: dashboardCloneLoading } = useDashboardCloneMutation({
    isPrivate: computed(() => state.isPrivate),
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
});

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

<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PRadio, PTextInput, PI,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import type {
    DashboardLayoutWidgetInfo, DashboardVariablesSchema, DashboardType,
} from '@/schema/dashboard/_types/dashboard-type';
import type { CreateDashboardParameters } from '@/schema/dashboard/dashboard/api-verbs/create';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardDetailInfoStoreState } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    visible?: boolean;
    dashboard?: DashboardModel;
    dashboardDetailInfo?: DashboardDetailInfoStoreState;
    manageDisabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboard: () => ({}),
    dashboardDetailInfo: () => ({}),
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const {
    forms: {
        name,
        viewers,
    },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
    viewers: 'PRIVATE' as DashboardType,
}, {
    name(value: string) {
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
    viewers(value: DashboardType) { return value.length ? '' : i18n.t('DASHBOARDS.FORM.REQUIRED'); },
});
const currentRouteName = SpaceRouter.router.currentRoute.name;
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    proxyVisible: useProxyValue('visible', props, emit),
    filteredVisibilityList: computed(() => [
        { name: 'PRIVATE', label: i18n.t('DASHBOARDS.FORM.LABEL_PRIVATE'), icon: 'ic_lock-filled' },
        { name: 'PUBLIC', label: i18n.t('DASHBOARDS.FORM.LABEL_PUBLIC') },
    ]),
    projectId: computed(() => {
        if (props.dashboard?.project_id?.length) return props.dashboard.project_id;
        if (props.dashboardDetailInfo?.projectId?.length) return props.dashboardDetailInfo.projectId;
        return '';
    }),
    dashboardNameList: computed<string[]>(() => {
        if (state.isAdminMode) return dashboardGetters.domainItems.map((item) => item.name);
        if (state.projectId) {
            return dashboardGetters.projectItems
                .filter((item) => (
                    item.project_id === state.projectId)
                            && item.name !== props.dashboard?.name)
                .map((_item) => _item.name);
        }
        return dashboardGetters.workspaceItems.map((item) => item.name);
    }),
    layouts: computed<DashboardLayoutWidgetInfo[][]>(() => {
        if (props.dashboard?.layouts) return props.dashboard?.layouts;
        if (props.dashboardDetailInfo?.dashboardWidgetInfoList) return props.dashboardDetailInfo?.dashboardWidgetInfoList;
        return [];
    }),
    variablesSchema: computed<DashboardVariablesSchema>(() => {
        if (props.dashboard?.variables_schema) return props.dashboard?.variables_schema;
        if (props.dashboardDetailInfo?.variablesSchema) return props.dashboardDetailInfo?.variablesSchema;
        return { properties: {}, order: [] };
    }),
});

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
};

const createDashboard = async () => {
    try {
        const params: CreateDashboardParameters = {
            name: name.value,
            dashboard_type: viewers.value,
            layouts: state.layouts,
            labels: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.labels : dashboardDetailState.dashboardInfo?.labels,
            settings: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.settings : dashboardDetailState.dashboardInfo?.settings,
            variables: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.variables : dashboardDetailState.dashboardInfo?.variables,
            variables_schema: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? state.variablesSchema : dashboardDetailState.dashboardInfo?.variables_schema,
            resource_group: 'WORKSPACE',
            project_id: state.projectId,
        };
        const res = await dashboardStore.createDashboard(params);
        return res.dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
    }
    return undefined;
};

const handleConfirm = async () => {
    if (!isAllValid) return;
    const clonedDashboardId = await createDashboard();
    if (clonedDashboardId) {
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: clonedDashboardId },
        });
    }
    state.proxyVisible = false;
};

const init = () => {
    initForm('name', `Clone - ${props.dashboard?.name}`);
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    init();
});
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.FORM.CLONE_TITLE')"
                    size="sm"
                    :disabled="!isAllValid"
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
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_VIEWERS')"
                           :invalid="invalidState.viewers"
                           :invalid-text="invalidTexts.viewers"
                           required
                           class="mt-6"
            >
                <p-radio v-for="{ name: visibilityName, label, icon } in state.filteredVisibilityList"
                         :key="visibilityName"
                         :value="visibilityName"
                         :selected="viewers"
                         class="radio-group"
                         @change="setForm('viewers', $event)"
                >
                    <p-i v-if="icon"
                         :name="icon"
                         width="0.875rem"
                         height="0.875rem"
                         :color="gray[500]"
                         class="ml-1"
                    />
                    <span class="ml-1">{{ label }}</span>
                </p-radio>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-clone-modal {
    .radio-group {
        @apply inline-block;
        margin-bottom: 0.625rem;
    }
    .p-text-input {
        @apply w-full;
    }
}
</style>

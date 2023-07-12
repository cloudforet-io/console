<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DashboardViewer, DashboardConfig, DashboardVariablesSchema } from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import type { DashboardDetailInfoStoreState } from '@/services/dashboards/store/dashboard-detail-info';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
    visible: boolean;
    dashboard: DashboardModel;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    dashboard: () => ({}) as DashboardModel,
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const router = useRouter();
const { t } = useI18n();
const store = useStore();

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
    viewers: '',
}, {
    name(value: string) {
        if (value.length > 100) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
    viewers(value: DashboardViewer) { return value.length ? '' : t('DASHBOARDS.FORM.REQUIRED'); },
});
const currentRouteName = router.currentRoute.value.name;
const state = reactive({
    proxyVisible: props.visible,
    filteredVisibilityList: computed(() => [
        { name: DASHBOARD_VIEWER.PRIVATE, label: t('DASHBOARDS.FORM.LABEL_PRIVATE') },
        { name: DASHBOARD_VIEWER.PUBLIC, label: t('DASHBOARDS.FORM.LABEL_PUBLIC') },
    ]),
    projectId: computed(() => {
        if (Object.prototype.hasOwnProperty.call(props.dashboard ?? {}, 'projectId')) {
            return (props.dashboard as unknown as DashboardDetailInfoStoreState).projectId;
        } if (Object.prototype.hasOwnProperty.call(props.dashboard ?? {}, 'project_id')) {
            return (props.dashboard as ProjectDashboardModel).project_id;
        } return '';
    }),
    dashboardNameList: computed<string[]>(() => {
        if (state.projectId) {
            return store.state.dashboard.projectItems
                .filter((item) => (
                    item.project_id === state.projectId)
                            && item.name !== props.dashboard?.name)
                .map((_item) => _item.name);
        }
        return store.state.dashboard.domainItems.map((item) => item.name);
    }),
    layouts: computed<DashboardLayoutWidgetInfo[]|DashboardLayoutWidgetInfo[][]>(() => {
        if (props.dashboard?.layouts) return props.dashboard?.layouts;
        if ((props.dashboard as unknown as DashboardDetailInfoStoreState)?.dashboardWidgetInfoList) {
            return (props.dashboard as unknown as DashboardDetailInfoStoreState)?.dashboardWidgetInfoList;
        }
        return [];
    }),
    variablesSchema: computed<DashboardVariablesSchema>(() => {
        if (props.dashboard?.variables_schema) return props.dashboard?.variables_schema;
        if ((props.dashboard as unknown as DashboardDetailInfoStoreState)?.variablesSchema) {
            return (props.dashboard as unknown as DashboardDetailInfoStoreState)?.variablesSchema;
        }
        return { properties: {}, order: [] };
    }),
    apiParam: computed<Partial<DashboardConfig>>(() => ({
        name: name.value,
        viewers: viewers.value,
        layouts: state.layouts,
        labels: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.labels : dashboardDetailState.dashboardInfo?.labels,
        settings: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.settings : dashboardDetailState.dashboardInfo?.settings,
        variables: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? props.dashboard?.variables : dashboardDetailState.dashboardInfo?.variables,
        variables_schema: (currentRouteName === DASHBOARDS_ROUTE.ALL._NAME) ? state.variablesSchema : dashboardDetailState.dashboardInfo?.variables_schema,
    })),
});

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
    emit('update:visible', visible);
};

const createDomainDashboard = async (): Promise<string|undefined> => {
    try {
        const res = await SpaceConnector.clientV2.dashboard.domainDashboard.create(state.apiParam);
        return res.domain_dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
    }
    return undefined;
};

const createProjectDashboard = async (): Promise<string|undefined> => {
    try {
        const res = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
            ...state.apiParam,
            project_id: state.projectId,
        });
        return res.project_dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
    }
    return undefined;
};

const handleConfirm = async () => {
    if (!isAllValid) return;
    const clonedDashboardId = state.projectId ? await createProjectDashboard() : await createDomainDashboard();
    if (clonedDashboardId) {
        const routeName = state.projectId ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await router.push({
            name: routeName,
            params: { dashboardId: clonedDashboardId },
        });
        await Promise.allSettled([
            store.dispatch('dashboard/loadProjectDashboard'),
            store.dispatch('dashboard/loadDomainDashboard'),
        ]);
    }
    emit('update:visible', false);
};

const init = () => {
    setForm('name', `Clone - ${props.dashboard.name}`);
    initForm('viewers', '');
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    init();
});

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="t('DASHBOARDS.FORM.CLONE_TITLE')"
                    size="sm"
                    :disabled="!isAllValid"
                    class="dashboard-clone-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
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
            <p-field-group :label="t('DASHBOARDS.FORM.LABEL_VIEWERS')"
                           :invalid="invalidState.viewers"
                           :invalid-text="invalidTexts.viewers"
                           required
                           class="mt-6"
            >
                <p-radio v-for="{ name: visibilityName, label } in state.filteredVisibilityList"
                         :key="visibilityName"
                         :value="visibilityName"
                         :selected="viewers"
                         class="radio-group"
                         @change="setForm('viewers', $event)"
                >
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

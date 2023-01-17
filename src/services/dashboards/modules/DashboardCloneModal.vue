<template>
    <p-button-modal :visible="proxyVisible"
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
                <p-radio v-for="{ name: visibilityName, label } in filteredVisibilityList"
                         :key="visibilityName"
                         :value="visibilityName"
                         :selected="viewers"
                         class="radio-group"
                         @change="setForm('viewers', $event)"
                >
                    <span class="capitalize ml-1">{{ label.toLowerCase() }}</span>
                </p-radio>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { PropType, SetupContext } from 'vue';
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DashboardViewer, DashboardConfig, DashboardVariablesSchema } from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardDetailInfoStoreState } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type { DashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
    visible: boolean;
    dashboard: DashboardModel;
    manageDisabled: boolean;
}

const visibilityList = [
    {
        name: DASHBOARD_VIEWER.PRIVATE,
        label: i18n.t('DASHBOARDS.FORM.LABEL_PRIVATE'),
    },
    {
        name: DASHBOARD_VIEWER.PUBLIC,
        label: i18n.t('DASHBOARDS.FORM.LABEL_PUBLIC'),
    },
];
export default defineComponent<Props>({
    name: 'DashboardCloneModal',
    components: {
        PButtonModal,
        PRadio,
        PFieldGroup,
        PTextInput,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: undefined,
            required: true,
        },
        dashboard: {
            // NOTE:: coming from data of DashboardDetailPage / DashboardBoardList have different object.
            // checking types would be good to reading codes.
            type: Object as PropType<DashboardModel|DashboardDetailInfoStoreState>,
            default: () => ({}),
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const {
            forms: {
                name,
                viewers,
            },
            setForm,
            initForm,
            invalidState,
            invalidTexts,
            validate,
            isAllValid,
        } = useFormValidator({
            name: '',
            viewers: '',
        }, {
            name(value: string) {
                if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
                if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
                return '';
            },
            viewers(value: DashboardViewer) { return value.length ? '' : i18n.t('DASHBOARDS.FORM.REQUIRED'); },
        });

        const state = reactive({
            proxyVisible: props.visible,
            filteredVisibilityList: computed(() => visibilityList),
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
                labels: props.dashboard?.labels,
                settings: props.dashboard?.settings,
                variables: props.dashboard?.variables,
                variables_schema: state.variablesSchema,
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
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
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
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
            }
            return undefined;
        };

        const handleConfirm = async () => {
            if (!isAllValid) return;
            const clonedDashboardId = state.projectId ? await createProjectDashboard() : await createDomainDashboard();
            if (clonedDashboardId) {
                const routeName = state.projectId ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
                await SpaceRouter.router.push({
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

        return {
            name,
            viewers,
            invalidState,
            invalidTexts,
            setForm,
            validate,
            isAllValid,
            ...toRefs(state),
            handleConfirm,
            handleUpdateVisible,
        };
    },
});
</script>
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

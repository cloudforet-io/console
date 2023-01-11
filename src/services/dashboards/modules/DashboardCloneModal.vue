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
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @input="setForm('name', $event)"
                />
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

import type { DashboardViewer } from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type { DashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

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
            type: Object as PropType<DashboardModel>,
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

        const dashboardDetailInfoStore = useDashboardDetailInfoStore();
        const state = reactive({
            proxyVisible: props.visible,
            filteredVisibilityList: computed(() => visibilityList),
            isProjectDashboard: computed(() => Object.prototype.hasOwnProperty.call(props.dashboard ?? {}, 'project_id')),
            dashboardNameList: computed<string[]>(() => {
                if (state.isProjectDashboard) {
                    return store.state.dashboard.projectItems
                        .filter((item) => (
                            item.project_id === (props.dashboard as ProjectDashboardModel).project_id)
                            && item.name !== props.dashboard?.name)
                        .map((_item) => _item.name);
                }
                return store.state.dashboard.domainItems.map((item) => {
                    if (item.name !== props.dashboard?.name) return item.name;
                    return '';
                });
            }),
        });

        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        const createDomainDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.clientV2.dashboard.domainDashboard.create({
                    // viewers: viewers.value
                    // TODO:: parameters here
                });
                return res.domain_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
            }
            return undefined;
        };

        const createProjectDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
                    // viewers: viewers.value
                    // TODO:: parameters here
                });
                return res.project_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
            }
            return undefined;
        };

        const handleConfirm = async () => {
            if (!isAllValid) return;
            const clonedDashboardId = state.isProjectDashboard ? await createDomainDashboard() : await createProjectDashboard();
            await dashboardDetailInfoStore.getDashboardInfo(clonedDashboardId);
            if (clonedDashboardId) {
                await SpaceRouter.router.push({
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: { dashboardScope: state.isProjectDashboard ? 'project' : 'domain', dashboardId: clonedDashboardId },
                });
            }
            emit('update:visible', false);
        };

        const init = () => {
            initForm('name', `Clone - ${props.dashboard.name}`);
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

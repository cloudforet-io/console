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
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { DashboardViewer } from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type { DashboardModel } from '@/services/dashboards/model';
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
            required: undefined,
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
            name(value: string) { return value.trim().length ? '' : i18n.t('DASHBOARDS.FORM.REQUIRED'); },
            viewers(value: DashboardViewer) { return value.length ? '' : i18n.t('DASHBOARDS.FORM.REQUIRED'); },
        });
        const state = reactive({
            proxyVisible: props.visible,
            filteredVisibilityList: computed(() => visibilityList),
        });
        const dashboardDetailInfoStore = useDashboardDetailInfoStore();
        // const _invalid_unique = 'Dashboard name must be unique'; i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE')
        // const _invalid_input = 'Please input dashboard name'; i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT')

        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        const createDomainDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.clientV2.dashboard.domainDashboard.create({
                    // viewers: viewers.value
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
                });
                return res.project_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'));
            }
            return undefined;
        };

        const handleConfirm = async () => {
            if (!isAllValid) return;
            const isProjectDashboard = Object.prototype.hasOwnProperty.call(props.dashboard, 'project_id');
            const clonedDashboardId = isProjectDashboard ? await createDomainDashboard() : await createProjectDashboard();
            // TODO:: connect dashboard store
            await dashboardDetailInfoStore.getDashboardInfo(clonedDashboardId);
            if (clonedDashboardId) {
                await SpaceRouter.router.push({
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: { dashboardScope: isProjectDashboard ? 'project' : 'domain', dashboardId: clonedDashboardId },
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

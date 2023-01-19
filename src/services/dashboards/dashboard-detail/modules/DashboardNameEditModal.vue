<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="$t('DASHBOARDS.FORM.UPDATE_TITLE')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="dashboard-name-edit-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="invalidState._name"
                           :invalid-text="invalidTexts._name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState._name"
                              @update:value="setForm('_name', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

interface Props {
    visible: boolean;
    dashboardId: string;
    name: string;
}
export default defineComponent<Props>({
    name: 'DashboardNameEditModal',
    components: {
        PButtonModal,
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
            required: true,
        },
        dashboardId: {
            type: String,
            required: true,
            default: '',
        },
        name: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup(props, { emit }: SetupContext) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;
        const {
            forms: {
                _name,
            },
            setForm,
            initForm,
            invalidState,
            invalidTexts,
            validate,
            isAllValid,
        } = useFormValidator({
            _name: '',
        }, {
            _name(value: string) {
                if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
                if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
                if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
                return '';
            },
        });
        const state = reactive({
            proxyVisible: props.visible,
            dashboardNameList: computed<string[]>(() => store.getters['dashboard/getDashboardNameList'](dashboardDetailState.projectId, dashboardDetailState.name)),
        });

        // const _invalid_unique = 'Dashboard name must be unique'; i18n.t('VALIDATION_DASHBOARD_NAME_UNIQUE')
        // const _invalid_input = 'Please input dashboard name'; i18n.t('VALIDATION_DASHBOARD_NAME_INPUT')

        const isProjectDashboard = props.dashboardId?.startsWith('project');

        const updateDashboard = async () => {
            try {
                if (isProjectDashboard) {
                    await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                        project_dashboard_id: props.dashboardId,
                        name: _name.value,
                    });
                } else {
                    await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                        domain_dashboard_id: props.dashboardId,
                        name: _name.value,
                    });
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_EDIT_NAME'));
            }
        };

        const loadDashboard = async () => {
            if (isProjectDashboard) {
                await store.dispatch('dashboard/loadProjectDashboard');
            } else {
                await store.dispatch('dashboard/loadDomainDashboard');
            }
        };

        const handleConfirm = async () => {
            await updateDashboard();
            await loadDashboard();
            emit('update:visible', false);
            emit('confirm', _name.value);
        };

        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        const init = () => {
            initForm('_name', props.name);
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
            init();
        });
        return {
            _name,
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
.dashboard-name-edit-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>

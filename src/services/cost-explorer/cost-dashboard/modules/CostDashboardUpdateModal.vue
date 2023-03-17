<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.UPDATE_DASHBOARD')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="cost-dashboard-update-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCostExplorerDashboardStore } from '@/services/cost-explorer/store/cost-explorer-dashboard-store';


interface Props {
    visible: boolean;
    dashboardId: string;
    dashboardName: string;
}
export default defineComponent<Props>({
    name: 'CostDashboardUpdateModal',
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
            default: '',
        },
        dashboardName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const costExplorerDashboardStore = useCostExplorerDashboardStore();

        const {
            forms: {
                name,
            },
            setForm,
            initForm,
            invalidState,
            invalidTexts,
            validate,
            isAllValid,
        } = useFormValidator({
            name: '',
        }, {
            name(value: string) { return value.trim().length ? '' : i18n.t('DASHBOARDS.FORM.REQUIRED'); },
        });
        const state = reactive({
            proxyVisible: props.visible,
        });

        const updateDashboard = async () => {
            try {
                if (props.dashboardId.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.update({
                        user_dashboard_id: props.dashboardId,
                        name: name.value,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.update({
                        public_dashboard_id: props.dashboardId,
                        name: name.value,
                    });
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_UPDATE_DASHBOARD_NAME'));
            }
        };

        const handleConfirm = async () => {
            await updateDashboard();
            await costExplorerDashboardStore.setDashboardList();
            emit('update:visible', false);
            emit('confirm', name.value);
        };

        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        const init = () => {
            initForm('name', props.dashboardName);
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
            init();
        });
        return {
            name,
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
.cost-dashboard-update-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>

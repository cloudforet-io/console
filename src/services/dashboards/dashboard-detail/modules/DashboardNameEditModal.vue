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
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @input="setForm('name', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

interface Props {
    visible: boolean;
    dashboardId: string;
    dashboardName: string;
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
        dashboardName: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup(props, { emit }: SetupContext) {
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

        const isProjectDashboard = Boolean(props.dashboardId?.startsWith('project'));

        const updateDashboard = async () => {
            try {
                if (isProjectDashboard) {
                    await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                        project_dashboard_id: props.dashboardId,
                        name: name.value,
                    });
                } else {
                    await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                        domain_dashboard_id: props.dashboardId,
                        name: name.value,
                    });
                }
                // song-lang
                showSuccessMessage('Successfully updated dashboard name', '');
            } catch (e) {
                // song-lang
                showSuccessMessage('Failed to update dashboard name', '');
                ErrorHandler.handleError(e);
            }
        };

        const loadDashboard = async () => {
            if (isProjectDashboard) {
                await store.dispatch('dashboard/loadProjectDashboard');
            } else {
                await store.dispatch('dashboard/loadDomainDashboard');
            }
        };

        const handleConfirm = () => {
            updateDashboard();
            loadDashboard();
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
.dashboard-name-edit-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>

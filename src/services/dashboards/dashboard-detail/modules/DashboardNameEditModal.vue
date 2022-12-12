<template>
    <!--    song-lang-->
    <p-button-modal :visible="proxyVisible"
                    :header-title="$t('Update Dashboard')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="dashboard-name-edit-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <!--            song-lang-->
            <p-field-group :label="$t('Dashboard Name')"
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

// import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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
            default: '',
        },
        dashboardName: {
            type: String,
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
            // song-lang
            name(value: string) { return value.trim().length ? '' : 'Required Field'; },
        });
        const state = reactive({
            proxyVisible: props.visible,
        });

        const updateDashboard = async () => {
            try {
                if (props.dashboardId.startsWith('user')) {
                    // TODO:: connect custom-dashboard update api
                    // await SpaceConnector.client.costAnalysis.userDashboard.update({
                    //     user_dashboard_id: props.dashboardId,
                    //     name: name.value,
                    // });
                } else {
                    // await SpaceConnector.client.costAnalysis.publicDashboard.update({
                    //     public_dashboard_id: props.dashboardId,
                    //     name: name.value,
                    // });
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleConfirm = () => {
            updateDashboard();
            // costExplorerStore.dispatch('setDashboardList');
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

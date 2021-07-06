<template>
    <div class="alert-actions">
        <p-button v-for="(button, index) in buttonGroup"
                  :key="index"
                  class="only-desktop action-button"
                  :style-type="button.styleType"
                  :outline="true"
                  :disabled="button.disabled"
                  @click="onSelectAction(button.name)"
        >
            {{ button.label }}
        </p-button>
        <p-select-dropdown :items="buttonGroup" class="only-mobile" @select="onSelectAction">
            {{ $t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
        </p-select-dropdown>

        <delete-modal
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.DELETE_MODAL.TITLE')"
            :visible.sync="visibleDeleteModal"
            @confirm="onDeleteConfirm"
        />

        <alert-resolve-modal
            :visible.sync="visibleResolveModal"
            :alert="selectedItems[0]"
            @confirm="$emit('refresh')"
        />

        <alert-merge-modal
            :visible.sync="visibleMergeModal"
            :items="selectedItems"
            @confirm="$emit('refresh')"
        />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { PButton, PSelectDropdown } from '@spaceone/design-system';

import { i18n } from '@/translations';
import { SpaceConnector } from '@/core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import AlertResolveModal from '@/views/monitoring/alert-manager/modules/alert-list/AlertResolveModal.vue';
import { ALERT_ACTION, ALERT_STATE_FILTER } from '@/views/monitoring/alert-manager/lib/config';
import AlertMergeModal from '@/views/monitoring/alert-manager/modules/alert-list/AlertMergeModal.vue';


export default {
    name: 'AlertActions',
    components: {
        AlertMergeModal,
        AlertResolveModal,
        PButton,
        PSelectDropdown,
        DeleteModal,
    },
    props: {
        selectedItems: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            buttonGroup: computed(() => ([
                {
                    name: ALERT_ACTION.acknowledge,
                    styleType: 'primary',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                    disabled: props.selectedItems.length < 1 || props.selectedItems[0]?.state !== ALERT_STATE_FILTER.TRIGGERED,
                },
                {
                    name: ALERT_ACTION.resolve,
                    styleType: 'secondary-dark',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.RESOLVE'),
                    disabled: props.selectedItems.length !== 1 || [ALERT_STATE_FILTER.ACKNOWLEDGED, ALERT_STATE_FILTER.TRIGGERED].includes(props.selectedItems[0]?.state),
                },
                {
                    name: ALERT_ACTION.merge,
                    styleType: 'primary-dark',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.MERGE'),
                    disabled: props.selectedItems.length < 2,
                },
                {
                    name: ALERT_ACTION.delete,
                    styleType: 'alert',
                    label: i18n.t('MONITORING.ALERT.ALERT_LIST.DELETE'),
                    disabled: props.selectedItems.length !== 1,
                },
            ])),
            visibleDeleteModal: false,
            visibleResolveModal: false,
            visibleMergeModal: false,
        });

        const updateAlertState = async (alertState: ALERT_STATE_FILTER) => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    // eslint-disable-next-line camelcase
                    alert_id: props.selectedItems[0]?.alert_id,
                    state: alertState,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
                emit('refresh');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e, root);
            }
        };


        const onDeleteConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    // eslint-disable-next-line camelcase
                    alert_id: props.selectedItems[0]?.alert_id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_DELETE'), '', root);
                state.visibleDeleteModal = false;
                emit('refresh');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_DELETE'), e, root);
            }
        };

        const onSelectAction = async (type: ALERT_ACTION) => {
            if (type === ALERT_ACTION.acknowledge) {
                await updateAlertState(ALERT_STATE_FILTER.ACKNOWLEDGED);
            } else if (type === ALERT_ACTION.resolve) {
                state.visibleResolveModal = true;
            } else if (type === ALERT_ACTION.merge) {
                state.visibleMergeModal = true;
            } else if (type === ALERT_ACTION.delete) {
                state.visibleDeleteModal = true;
            }
        };

        return {
            ...toRefs(state),
            onSelectAction,
            onDeleteConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    .action-button {
        @apply bg-white;
        margin-left: 0.5rem;
        line-height: 1;
    }

    .only-desktop {
        @apply inline-block;
    }
    .only-mobile {
        @apply hidden;
    }

    @screen mobile {
        .only-desktop {
            @apply hidden;
        }

        .only-mobile {
            @apply inline-block;
        }
    }
}
</style>

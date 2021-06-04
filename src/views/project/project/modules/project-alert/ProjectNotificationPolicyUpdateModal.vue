<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.ALERT.UPDATE_NOTIFICATION_POLICY_MODAL_TITLE')"
        size="sm"
        fade
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ $t('PROJECT.DETAIL.ALERT.UPDATE_NOTIFICATION_MODAL_HELP_TEXT') }}</p>
                <p-select-card v-for="option in notificationOptions" :key="option.name"
                               v-model="selectedOption"
                               :value="option.name"
                               :label="option.label"
                               :icon="option.icon"
                               block
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('PROJECT.DETAIL.ALERT.CHANGE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';


enum NOTIFICATION_OPTION {
    all = 'ALL',
    highOnly = 'HIGH_ONLY'
}

export default {
    name: 'ProjectNotificationPolicyUpdateModal',
    components: {
        PButtonModal,
        PSelectCard,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        notificationOption: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            notificationOptions: computed(() => ([
                {
                    name: NOTIFICATION_OPTION.all,
                    label: vm.$t('PROJECT.DETAIL.ALERT.ALL_NOTIFICATIONS'),
                },
                {
                    name: NOTIFICATION_OPTION.highOnly,
                    label: vm.$t('PROJECT.DETAIL.ALERT.HIGH_URGENCY_NOTIFICATIONS'),
                    icon: 'ic_alert',
                },
            ])),
            selectedOption: '',
        });

        const onClickConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.update({
                    project_id: props.projectId,
                    notification_options: {
                        urgency: state.selectedOption,
                    },
                });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_NOTIFICATION_POLICY'), '', root);
                emit('refresh');
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_NOTIFICATION_POLICY'), e, root);
            } finally {
                state.proxyVisible = false;
            }
        };

        watch(() => props.notificationOption, (notificationOption) => {
            state.selectedOption = notificationOption;
        });

        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content-wrapper {
    @apply grid gap-2;
    padding: 1rem 0;
}
</style>

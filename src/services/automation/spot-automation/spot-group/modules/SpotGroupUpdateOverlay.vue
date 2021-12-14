<template>
    <fragment>
        <overlay-page-layout :visible="proxyVisible">
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.TITLE')" child
                          @goBack="proxyVisible = false"
            />
            <spot-group-schedule-policy-settings v-if="spotGroup"
                                                 :resource-id="resourceId"
                                                 :origin-on-demand="spotGroup.options.min_ondemand"
                                                 @change="onChangeSchedulePolicy"
            />
            <spot-group-instance-type-selection v-if="spotGroup"
                                                :resource-id="resourceId"
                                                :resource-type="resourceType"
                                                :origin-candidates="spotGroup.options.candidate_types"
                                                @change="onChangeInstanceType"
            />

            <div v-if="spotGroup || !loading" class="button-group">
                <p-button class="text-button" style-type="primary-dark" size="lg"
                          :loading="loading"
                          @click="onClickSave"
                >
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.SAVE') }}
                </p-button>
                <p-button class="text-button" style-type="outline gray900" size="lg"
                          :disabled="loading"
                          @click="proxyVisible = false"
                >
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CANCEL') }}
                </p-button>
            </div>
        </overlay-page-layout>

        <spot-group-check-modal :visible.sync="visibleCheckModal"
                                edit-mode
                                :recommend-types="recommendTypes"
                                :on-demand="onDemand"
                                :spot-instance="spotInstance"
                                :on-demand-type="onDemandType"
                                @confirm="onCheckConfirm"
        />
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButton, PPageTitle } from '@spaceone/design-system';
import SpotGroupSchedulePolicySettings from '@/services/automation/spot-automation/spot-group/modules/SpotGroupSchedulePolicySettings.vue';
import SpotGroupInstanceTypeSelection from '@/services/automation/spot-automation/spot-group/modules/SpotGroupInstanceTypeSelection.vue';
import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';
import SpotGroupCheckModal from '@/services/automation/spot-automation/spot-group/modules/SpotGroupCheckModal.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { SETTINGS_TYPE } from '@/services/automation/spot-automation/lib/config';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { i18n } from '@/translations';

interface Props {
    spotGroupId: string;
}
export default {
    name: 'SpotGroupUpdateOverlay',
    components: {
        SpotGroupCheckModal,
        OverlayPageLayout,
        SpotGroupInstanceTypeSelection,
        SpotGroupSchedulePolicySettings,
        PPageTitle,
        PButton,
    },
    props: {
        spotGroupId: {
            type: String,
            default: '',
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit, root }) {
        const state = reactive({
            resourceId: computed(() => state.spotGroup?.resource_id),
            resourceType: computed(() => state.spotGroup?.resource_type),
            loading: true,
            spotGroup: null as null|any,
            visibleCheckModal: false,
            onDemand: 0,
            spotInstance: 0,
            onDemandType: SETTINGS_TYPE.ratio,
            recommendTypes: [] as string[],
            proxyVisible: makeProxy('visible', props, emit),
        });

        const onChangeSchedulePolicy = ({ onDemand, spotInstance, type }) => {
            state.onDemand = onDemand;
            state.spotInstance = spotInstance;
            state.onDemandType = type;
        };

        const onChangeInstanceType = (types) => {
            state.recommendTypes = types;
        };

        const getSpotGroupInfo = async () => {
            state.loading = true;
            try {
                state.spotGroup = await SpaceConnector.client.spotAutomation.spotGroup.get({
                    spot_group_id: props.spotGroupId,
                });
            } catch (e) {
                state.spotGroup = null;
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.spotGroupId, async (spotGroupId) => {
            if (spotGroupId) await getSpotGroupInfo();
        }, { immediate: true });

        const onClickSave = () => {
            state.visibleCheckModal = true;
        };

        const onCheckConfirm = async () => {
            try {
                const options: any = {
                    min_ondemand: {
                        type: state.onDemandType,
                        value: state.onDemand,
                    },
                    candidate_types: state.recommendTypes,
                };

                await SpaceConnector.client.spotAutomation.spotGroup.update({
                    spot_group_id: props.spotGroupId,
                    options,
                });

                showSuccessMessage(i18n.t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_S_EDIT_SPOT_GROUP'), '', root);
                state.visibleCheckModal = false;
                state.proxyVisible = false;
            } catch (e) {
                state.visibleCheckModal = false;
                showErrorMessage(i18n.t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_E_EDIT_SPOT_GROUP'), e);
            }
        };

        return {
            ...toRefs(state),
            onChangeSchedulePolicy,
            onChangeInstanceType,
            onClickSave,
            onCheckConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.button-group {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 1rem;
    .text-button {
        margin-left: 1rem;
    }
}
</style>

<template>
    <fragment>
        <overlay-page-layout :visible="proxyVisible">
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.TITLE')" child
                          @goBack="proxyVisible = false"
            />
            <schedule-policy-settings v-if="spotGroup"
                                      :resource-id="resourceId"
                                      :origin-on-demand="spotGroup.options.min_ondemand"
                                      @change="onChangeSchedulePolicy"
            />
            <instance-type-selection v-if="spotGroup"
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
import SchedulePolicySettings from '@/views/automation/spot-automation/modules/SchedulePolicySettings.vue';
import InstanceTypeSelection from '@/views/automation/spot-automation/modules/InstanceTypeSelection.vue';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import OverlayPageLayout from '@/common/components/layouts/OverlayPageLayout.vue';
import { PButton, PPageTitle } from '@spaceone/design-system';
import SpotGroupCheckModal from '@/views/automation/spot-automation/modules/SpotGroupCheckModal.vue';
import { SETTINGS_TYPE } from '@/views/automation/spot-automation/lib/config';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { i18n } from '@/translations';
import { makeProxy } from '@/lib/compostion-util';

interface Props {
    spotGroupId: string;
}
export default {
    name: 'UpdateSpotGroupOverlay',
    components: {
        SpotGroupCheckModal,
        OverlayPageLayout,
        InstanceTypeSelection,
        SchedulePolicySettings,
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
                    // eslint-disable-next-line camelcase
                    spot_group_id: props.spotGroupId,
                });
            } catch (e) {
                console.error(e);
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
                    // eslint-disable-next-line camelcase
                    min_ondemand: {
                        type: state.onDemandType,
                        value: state.onDemand,
                    },
                    // eslint-disable-next-line camelcase
                    candidate_types: state.recommendTypes,
                };

                await SpaceConnector.client.spotAutomation.spotGroup.update({
                    // eslint-disable-next-line camelcase
                    spot_group_id: props.spotGroupId,
                    options,
                });

                showSuccessMessage(i18n.t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_S_EDIT_SPOT_GROUP'), '', root);
                state.visibleCheckModal = false;
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                state.visibleCheckModal = false;
                showErrorMessage(i18n.t('AUTOMATION.SPOT_AUTOMATION.DETAIL.EDIT.ALT_E_EDIT_SPOT_GROUP'), e, root);
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

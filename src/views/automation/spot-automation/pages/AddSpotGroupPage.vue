<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE_TITLE')" child @goBack="onClickGoBack" />

        <p-pane-layout class="base-info section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.LABEL') }}
            </p>
            <base-information-input :show-validation="showValidation" @change="onChangeBaseInfo" />
        </p-pane-layout>

        <p-pane-layout class="section cloud-service">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.LABEL') }}
            </p>
            <resource-selection :show-validation="showValidation"
                                @change="onChangeResource"
            />
        </p-pane-layout>

        <p-pane-layout class="schedule-policy section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.LABEL') }}
            </p>
            <schedule-policy-settings v-if="selectedResource"
                                      :resource-id="selectedResource.cloud_service_id"
                                      @change="onChangeSchedulePolicy"
            />
            <p-empty v-else>
                <div class="w-full mt-2">
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SELECT_RESOURCE') }}
                </div>
            </p-empty>
        </p-pane-layout>

        <p-pane-layout class="instance-type section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.LABEL') }}
            </p>
            <instance-type-selection v-if="selectedResource"
                                     :resource-id="selectedResource.cloud_service_id"
                                     :resource-type="selectedResourceType"
                                     :show-validation="showValidation"
                                     @change="onChangeInstanceType"
            />
            <p-empty v-else>
                <div class="w-full mt-2">
                    {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SELECT_RESOURCE') }}
                </div>
            </p-empty>
        </p-pane-layout>

        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :loading="loading"
                      :disabled="!isAllValid"
                      @click="onClickCreate"
            >
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      :disabled="loading"
                      @click="onClickGoBack"
            >
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CANCEL') }}
            </p-button>
        </div>

        <spot-group-create-check-modal :visible.sync="visibleCheckModal"
                                       :category="category"
                                       :selected-resource="selectedResource"
                                       :name="name"
                                       :recommend-types="recommendTypes"
                                       :on-demand="onDemand"
                                       :spot-instance="spotInstance"
                                       :on-demand-type="onDemandType"
                                       @confirm="onCheckConfirm"
        />
    </general-page-layout>
</template>
<script lang="ts">
import {
    PBreadcrumbs, PButton, PEmpty, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import ResourceSelection from '@/views/automation/spot-automation/modules/ResourceSelection.vue';
import BaseInformationInput from '@/views/automation/spot-automation/modules/BaseInformationInput.vue';
import SchedulePolicySettings from '@/views/automation/spot-automation/modules/SchedulePolicySettings.vue';
import InstanceTypeSelection from '@/views/automation/spot-automation/modules/InstanceTypeSelection.vue';
import { SETTINGS_TYPE } from '@/views/automation/spot-automation/config';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import SpotGroupCreateCheckModal from '@/views/automation/spot-automation/modules/SpotGroupCreateCheckModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'AddSpotGroupPage',
    components: {
        SpotGroupCreateCheckModal,
        InstanceTypeSelection,
        SchedulePolicySettings,
        BaseInformationInput,
        ResourceSelection,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        GeneralPageLayout,
        PButton,
        PEmpty,

    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            showValidation: false,
            category: '' as string,
            selectedResource: null as any,
            selectedResourceType: '',
            isResourceValid: false,
            name: '',
            tags: [],
            isBaseInfoValid: false,
            onDemand: 0,
            spotInstance: 0,
            onDemandType: SETTINGS_TYPE.ratio,
            isSchedulePolicyValid: false,
            recommendTypes: [] as string[],
            isRecommendTypesValid: false,
            options: computed(() => {
                const res: any = {};
                if (state.onDemandType === SETTINGS_TYPE.ratio) {
                    // eslint-disable-next-line camelcase
                    res.min_ondemand_ratio = state.onDemand;
                } else {
                    // eslint-disable-next-line camelcase
                    res.min_ondemand_size = state.onDemand;
                }

                // TODO: replace it after backend ready
                // eslint-disable-next-line camelcase
                res.recommend_types = 't2.large'; // state.recommendTypes;

                return res;
            }),
            isAllValid: computed(() => state.isResourceValid && state.isSchedulePolicyValid && state.isRecommendTypesValid && state.isBaseInfoValid),
            loading: false,
            visibleCheckModal: false,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        const onClickGoBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) vm.$router.push(nextPath);
            else vm.$router.back();
        };

        const onChangeResource = ({ category, resource, resourceType }, isValid) => {
            state.category = category || '';
            state.selectedResource = resource;
            state.selectedResourceType = resourceType;
            state.isResourceValid = isValid;
        };

        const onChangeBaseInfo = ({ name, tags }, isValid) => {
            state.name = name;
            state.tags = tags;
            state.isBaseInfoValid = isValid;
        };

        const onChangeSchedulePolicy = ({ onDemand, spotInstance, type }, isValid) => {
            state.onDemand = onDemand;
            state.spotInstance = spotInstance;
            state.onDemandType = type;
            state.isSchedulePolicyValid = isValid;
        };

        const onChangeInstanceType = (types, isValid) => {
            state.recommendTypes = types;
            state.isRecommendTypesValid = isValid;
        };

        const onClickCreate = async () => {
            if (!state.isAllValid) return;
            state.visibleCheckModal = true;
        };

        const onCheckConfirm = async () => {
            state.loading = true;
            const params: any = {
                name: state.name,
                resource_id: state.selectedResource.cloud_service_id,
                resource_type: state.selectedResourceType,
                tags: state.tags,
                user_id: store.state.user.userId,
                options: state.options,
            };


            try {
                await SpaceConnector.client.spotAutomation.spotGroup.create(params);

                showSuccessMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.ALT_S_CREATE_SPOT_GROUP'), '', vm.$root);
                vm.$router.push({ name: 'spotGroup' });
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.ALT_E_CREATE_SPOT_GROUP'), e, vm.$root);
            } finally {
                state.loading = false;
                state.visibleCheckModal = false;
            }
        };

        /* Init */
        (async () => {
        })();


        return {
            ...toRefs(state),
            routeState,
            onClickGoBack,
            onChangeResource,
            onChangeBaseInfo,
            onChangeSchedulePolicy,
            onChangeInstanceType,
            onClickCreate,
            onCheckConfirm,
        };
    },
};
</script>
<style lang="postcss" scoped>
.section {
    padding: 2rem 1rem 2.5rem 1rem;
    margin-bottom: 1rem;
    .title {
        font-size: 1.5rem;
        line-height: 135%;
        margin-bottom: 1.125rem;
    }
}
.button-group {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 1rem;
    .text-button {
        margin-left: 1rem;
    }
}
</style>

<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE_TITLE')" child @goBack="onClickGoBack" />

        <spot-group-base-information-input @change="onChangeBaseInfo" />

        <spot-group-service-category-selection @change="onChangeServiceCategory" />

        <spot-group-resource-selection :project-id="projectId" :category="category"
                                       @change="onChangeResource"
        />

        <spot-group-schedule-policy-settings :resource-id="selectedResource? selectedResource.cloud_service_id : ''"
                                             @change="onChangeSchedulePolicy"
        />

        <spot-group-instance-type-selection :resource-id="selectedResource ? selectedResource.cloud_service_id : ''"
                                            :resource-type="selectedResourceType"
                                            @change="onChangeInstanceType"
        />

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

        <spot-group-check-modal :visible.sync="visibleCheckModal"
                                :category="category ? category.label : ''"
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
    PBreadcrumbs, PButton, PPageTitle,
} from '@spaceone/design-system';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import SpotGroupResourceSelection from '@/services/automation/spot-automation/spot-group/modules/SpotGruopResourceSelection.vue';
import SpotGroupBaseInformationInput from '@/services/automation/spot-automation/spot-group/modules/SpotGroupBaseInformationInput.vue';
import SpotGroupSchedulePolicySettings from '@/services/automation/spot-automation/spot-group/modules/SpotGroupSchedulePolicySettings.vue';
import SpotGroupInstanceTypeSelection from '@/services/automation/spot-automation/spot-group/modules/SpotGroupInstanceTypeSelection.vue';
import { SETTINGS_TYPE } from '@/services/automation/spot-automation/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import SpotGroupCheckModal from '@/services/automation/spot-automation/spot-group/modules/SpotGroupCheckModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import SpotGroupServiceCategorySelection from '@/services/automation/spot-automation/spot-group/modules/SpotGroupServiceCategorySelection.vue';
import { SpotGroupResourceCategory } from '@/services/automation/spot-automation/type';
import { AUTOMATION_ROUTE } from '@/services/automation/routes';

export default {
    name: 'AddSpotGroupPage',
    components: {
        SpotGroupServiceCategorySelection,
        SpotGroupCheckModal,
        SpotGroupInstanceTypeSelection,
        SpotGroupSchedulePolicySettings,
        SpotGroupBaseInformationInput,
        SpotGroupResourceSelection,
        PBreadcrumbs,
        PPageTitle,
        GeneralPageLayout,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            category: null as SpotGroupResourceCategory|null,
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
            options: computed(() => ({
                // eslint-disable-next-line camelcase
                min_ondemand: {
                    type: state.onDemandType,
                    value: state.onDemand,
                },
                // eslint-disable-next-line camelcase
                candidate_types: state.recommendTypes,
            })),
            isAllValid: computed(() => state.isResourceValid && state.isSchedulePolicyValid && state.isRecommendTypesValid && state.isBaseInfoValid),
            loading: false,
            visibleCheckModal: false,
            projectId: computed(() => vm.$route.params.projectId),
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

        const onChangeServiceCategory = (category) => {
            state.category = category;
        };

        const onChangeResource = ({ resource, resourceType }, isValid) => {
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
                await vm.$router.push({ name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME });
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
            onChangeServiceCategory,
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
.button-group {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 1rem;
    .text-button {
        margin-left: 1rem;
    }
}
</style>

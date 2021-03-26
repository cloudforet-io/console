<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE_TITLE')" child @goBack="onClickGoBack" />

        <p-pane-layout class="section cloud-service">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.LABEL') }}
            </p>
            <resource-selection :show-validation="showValidation"
                                @change="onChangeResource"
            />
        </p-pane-layout>

        <p-pane-layout class="base-info section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.BASE_INFO.LABEL') }}
            </p>
            <base-information-input :show-validation="showValidation"
                                    @change="onChangeBaseInfo"
            />
        </p-pane-layout>

        <p-pane-layout class="schedule-policy section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.LABEL') }}
            </p>
            <schedule-policy-settings :desired-capacity="selectedResource ? selectedResource.data.desired_capacity : 0"
                                      @change="onChangeSchedulePolicy"
            />
        </p-pane-layout>

        <p-pane-layout class="instance-type section">
            <p class="title">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.LABEL') }}
            </p>
            <instance-type-selection :resource-id="selectedResource ? selectedResource.cloud_service_id : ''"
                                     :resource-type="selectedResourceType"
                                     @change="onChangeInstanceType"
            />
        </p-pane-layout>

        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :loading="loading"
                      :disabled="showValidation && !isAllValid"
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
    </general-page-layout>
</template>
<script lang="ts">
import {
    PBreadcrumbs, PButton, PPageTitle, PPaneLayout,
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

export default {
    name: 'AddSpotGroupPage',
    components: {
        InstanceTypeSelection,
        SchedulePolicySettings,
        BaseInformationInput,
        ResourceSelection,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        GeneralPageLayout,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            showValidation: false,
            selectedResource: null as any,
            selectedResourceType: '',
            isResourceValid: false,
            name: '',
            tags: [],
            isBaseInfoValid: false,
            onDemand: 0,
            onDemandType: SETTINGS_TYPE.ratio,
            options: computed(() => {
                if (state.onDemandType === SETTINGS_TYPE.ratio) {
                    return {
                        // eslint-disable-next-line camelcase
                        min_ondemand_ratio: state.onDemand,
                    };
                }
                return {
                    // eslint-disable-next-line camelcase
                    min_ondemand_size: state.onDemand,
                };
            }),
            isAllValid: computed(() => state.isResourceValid && state.isBaseInfoValid),
            loading: false,
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

        const onChangeSchedulePolicy = ({ onDemand, type }) => {
            state.onDemand = onDemand;
            state.onDemandType = type;
        };

        const onChangeInstanceType = () => {
            console.debug('change instance type');
        };

        const onClickCreate = async () => {
            state.showValidation = true;
            if (!state.isAllValid) return;

            state.loading = true;
            const params: any = {
                name: state.name,
                resource_id: state.selectedResource.cloud_service_id,
                resource_type: state.selectedResourceType,
                tags: state.tags,
                user_id: store.state.user.userId,
            };

            if (state.options) params.options = state.options;

            try {
                await SpaceConnector.client.spotAutomation.spotGroup.create(params);
                vm.$router.push({ name: 'spotGroup' });
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* Init */
        (async () => {
        })();


        return {
            ...toRefs(state),
            routeState,
            onClickCreate,
            onClickGoBack,
            onChangeResource,
            onChangeBaseInfo,
            onChangeSchedulePolicy,
            onChangeInstanceType,
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

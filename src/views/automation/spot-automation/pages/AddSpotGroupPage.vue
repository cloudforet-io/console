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

        <p-pane-layout class="instance-type section" />

        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      @click="onClickCreate"
            >
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      @click="onClickGoBack"
            >
                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CANCEL') }}
            </p-button>
        </div>
    </general-page-layout>
</template>
<script lang="ts">
import {
    PBreadcrumbs, PPageTitle, PPaneLayout, PButton,
} from '@spaceone/design-system';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import ResourceSelection from '@/views/automation/spot-automation/modules/ResourceSelection.vue';
import BaseInformationInput from '@/views/automation/spot-automation/modules/BaseInformationInput.vue';
import SchedulePolicySettings from '@/views/automation/spot-automation/modules/SchedulePolicySettings.vue';

export default {
    name: 'AddSpotGroupPage',
    components: {
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
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        const onClickCreate = () => {
            state.showValidation = true;
        };

        const onClickGoBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) vm.$router.push(nextPath);
            else vm.$router.back();
        };

        const onChangeResource = (item, isValid) => {
            console.debug('change resource', item, isValid);
            state.selectedResource = item;
            // TODO
        };

        const onChangeBaseInfo = ({ name, tags }, isValid) => {
            console.debug('change base info', name, tags, isValid);
            // TODO
        };

        const onChangeSchedulePolicy = ({ onDemand, type }) => {
            console.debug('change schedule policy', onDemand, type);
            // TODO
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

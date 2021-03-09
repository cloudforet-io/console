<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CREATE_TITLE')" child @goBack="onClickGoBack" />

        <p-pane-layout class="section cloud-service" />

        <p-pane-layout class="base-info section" />

        <p-pane-layout class="schedule-policy section" />

        <p-pane-layout class="instance-type section" />

        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg">
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

export default {
    name: 'AddSpotGroupPage',
    components: {
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        GeneralPageLayout,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
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


        return {
            ...toRefs(state),
            routeState,
            onClickGoBack,
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
    }
    .sub-title {
        margin-top: 1.5rem;
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

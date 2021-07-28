<template>
    <!-- You can choose a layout in src/common/components/layouts.
         Give component's name to root element or component with dash case. -->
    <general-page-layout class="total-dashboard">
        <!-- You can use tailwindcss class names.
             See tailwind.config.js to use customized classes. -->
        <div class="flex flex-wrap justify-between items-center">
            <p class="text-xl font-bold mb-4">
                ROOT DOMAIN - TOTAL DASHBOARD
            </p>
            <!-- To use spaceone design system components, see storybook. -->
            <p-button class="mb-4" size="sm" style-type="secondary"
                      :outline="true"
                      @click="test = !test"
            >
                Click me to {{ test ? 'STOP insert' : 'INSERT' }} 'test' to api parameters
            </p-button>
        </div>

        <!-- If you want to reload when the state is changed, bind key with reactive state. -->
        <div :key="test.toString()">
            <!-- Give extra parameter objects for api requests in widgets. -->
            <all-summary :extra-params="extraParams" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance, reactive, ref, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import AllSummary from '@/views/dashboard/modules/AllSummary.vue';


export default defineComponent({
    name: 'TotalDashboardPage',
    components: {
        GeneralPageLayout,
        AllSummary,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            test: false,
            extraParams: computed(() => (state.test ? { test: true } : {})),
        });

        /** Init */
        (async () => {
            // Widgets does not load required resources.
            // Page components need to load resources first.
            await vm.$store.dispatch('resource/provider/load');
        })();

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.total-dashboard {
}

</style>

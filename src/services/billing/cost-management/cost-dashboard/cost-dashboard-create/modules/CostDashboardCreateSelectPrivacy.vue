<template>
    <fragment>
        <span>Dashboard Privacy</span>
        <p-radio v-for="privacy in privacyList" :key="privacy" v-model="selectedPrivacy"
                 :value="privacy" @change="handleRadio"
        >
            <span class="radio-text">{{ privacy.toLowerCase() }}</span>
        </p-radio>
    </fragment>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';
import { DASHBOARD_PRIVACY_TYPE, DashboardPrivacyType } from '@/services/billing/cost-management/cost-dashboard/type';
import { PRadio } from '@spaceone/design-system';
import { store } from '@/store';


export default {
    name: 'CostDashboardCreateSelectPrivacy',
    components: {
        PRadio,
    },

    setup() {
        const state = reactive({
            selectedPrivacy: DASHBOARD_PRIVACY_TYPE.PUBLIC as DashboardPrivacyType,
            privacyList: [DASHBOARD_PRIVACY_TYPE.PUBLIC, DASHBOARD_PRIVACY_TYPE.USER],
        });

        const handleRadio = (value: DashboardPrivacyType) => {
            store.commit('service/costDashboardCreate/setDashboardPrivacy', value);
        };

        return {
            ...toRefs(state),
            handleRadio,
        };
    },
};
</script>

<style lang="postcss" scoped>
.radio-text {
    @apply capitalize;
}
</style>

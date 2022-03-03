<template>
    <fragment>
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.SAVE_AS') }}</h3>
        <p-radio v-for="privacy in filteredPrivacyList" :key="privacy.name" v-model="selectedPrivacy"
                 :value="privacy.name" class="mr-4"
                 @change="handleRadio"
        >
            <span class="capitalize ml-1">{{ privacy.label.toLowerCase() }}</span>
        </p-radio>
    </fragment>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { DASHBOARD_PRIVACY_TYPE, DashboardPrivacyType } from '@/services/billing/cost-management/cost-dashboard/type';
import { PRadio } from '@spaceone/design-system';
import { store } from '@/store';
import { i18n } from '@/translations';

const privacyList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PRIVATE'),
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PUBLIC'),
    },
];

export default {
    name: 'CostDashboardCreateSelectPrivacy',
    components: {
        PRadio,
    },

    setup() {
        const state = reactive({
            selectedPrivacy: DASHBOARD_PRIVACY_TYPE.USER as DashboardPrivacyType,
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            filteredPrivacyList: computed(() => (state.isAdmin ? privacyList : privacyList.filter(item => item.name === DASHBOARD_PRIVACY_TYPE.USER))),
        });

        const handleRadio = (value: DashboardPrivacyType) => {
            store.commit('service/costDashboard/setDashboardPrivacy', value);
        };

        return {
            ...toRefs(state),
            handleRadio,
        };
    },
};
</script>

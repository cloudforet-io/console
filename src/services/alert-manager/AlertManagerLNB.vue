<template>
    <l-n-b header="Alert Manager" :menu-set="MenuSet" />
</template>

<script lang="ts">
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { LNBItem } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';

const MenuSet: LNBItem[][] = [
    [
        {
            type: 'item', id: 'dashboard', label: 'Dashboard', to: { name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME },
        },
        {
            type: 'item', id: 'alert', label: 'Alert', to: { name: ALERT_MANAGER_ROUTE.ALERT._NAME },
        },
        {
            type: 'item', id: 'escalation-policy', label: 'Escalation Policy', to: { name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME },
        },
    ],
];

export default {
    name: 'AlertManagerLNB',
    components: {
        LNB,
    },
    setup() {
        return {
            MenuSet,
        };
    },
};
</script>

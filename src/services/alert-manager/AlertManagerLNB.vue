<template>
    <l-n-b header="Alert Manager" :menu-set="MenuSet" />
</template>

<script lang="ts">
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { LNBItemList } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';

const MenuSet: LNBItemList[] = [
    [
        {
            type: 'item', id: MENU_ID.ALERT_MANAGER_DASHBOARD, label: 'Dashboard', to: { name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME },
        },
        {
            type: 'item', id: MENU_ID.ALERT_MANAGER_ALERT, label: 'Alert', to: { name: ALERT_MANAGER_ROUTE.ALERT._NAME },
        },
        {
            type: 'item', id: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY, label: 'Escalation Policy', to: { name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME },
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

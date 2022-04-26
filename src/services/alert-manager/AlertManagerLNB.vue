<template>
    <l-n-b :header="header" :menu-set="menuSet" />
</template>

<script lang="ts">
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';
import { computed } from '@vue/composition-api';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

const lnbMenuIds = [MENU_ID.ALERT_MANAGER_DASHBOARD, MENU_ID.ALERT_MANAGER_ALERT, MENU_ID.ALERT_MANAGER_ESCALATION_POLICY];

export default {
    name: 'AlertManagerLNB',
    components: {
        LNB,
    },
    setup() {
        return {
            header: computed(() => MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_DASHBOARD].label),
            menuSet: computed<LNBMenu[]>(() => lnbMenuIds.map((id) => {
                const menuInfo = MENU_INFO_MAP[id];
                return ({
                    type: 'item', id, label: menuInfo.label, to: menuInfo.to,
                });
            })),
        };
    },
};
</script>

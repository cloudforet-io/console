<template>
    <l-n-b :header="header" :menu-set="menuSet" />
</template>

<script lang="ts">
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { store } from '@/store';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';

const lnbMenuIds = [MENU_ID.ALERT_MANAGER_DASHBOARD, MENU_ID.ALERT_MANAGER_ALERT, MENU_ID.ALERT_MANAGER_ESCALATION_POLICY];
export default {
    name: 'AlertManagerLNB',
    components: {
        LNB,
    },
    setup() {
        const state = reactive({
            header: computed(() => MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].label),
            menuSet: computed<LNBMenu[]>(() => filterLNBMenuByPermission(lnbMenuIds.map((id) => {
                const menuInfo = MENU_INFO_MAP[id];
                return ({
                    type: 'item', id, label: menuInfo.label, to: { name: id },
                });
            }), store.getters['user/pagePermissionList'])),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

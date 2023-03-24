<template>
    <l-n-b :header="header"
           :menu-set="menuSet"
    />
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

const lnbMenuIds = [MENU_ID.ALERT_MANAGER_DASHBOARD, MENU_ID.ALERT_MANAGER_ALERT, MENU_ID.ALERT_MANAGER_ESCALATION_POLICY];
export default {
    name: 'AlertManagerLNB',
    components: {
        LNB,
    },
    setup() {
        const state = reactive({
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].translationId)),
            menuSet: computed<LNBMenu[]>(() => filterLNBMenuByPermission(lnbMenuIds.map((id) => {
                const menuInfo = MENU_INFO_MAP[id];
                return ({
                    type: 'item', id, label: i18n.t(menuInfo.translationId), to: { name: id },
                });
            }), store.getters['user/pagePermissionList'])),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

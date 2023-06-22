<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocation } from 'vue-router';
import { useStore } from 'vuex';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';


const lnbMenuIds = [MENU_ID.ALERT_MANAGER_DASHBOARD, MENU_ID.ALERT_MANAGER_ALERT, MENU_ID.ALERT_MANAGER_ESCALATION_POLICY];

const store = useStore();
const { t } = useI18n();

const state = reactive({
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].translationId)),
    menuSet: computed<LNBMenu[]>(() => {
        const _menuSet = lnbMenuIds.map((id) => {
            const menuInfo = MENU_INFO_MAP[id];
            return ({
                type: MENU_ITEM_TYPE.ITEM,
                id,
                label: t(menuInfo.translationId),
                to: { name: id } as RouteLocation,
            });
        });
        return filterLNBMenuByPermission(_menuSet, store.getters['user/pagePermissionList']);
    }),
});

</script>

<template>
    <l-n-b :header="state.header"
           :menu-set="state.menuSet"
    />
</template>

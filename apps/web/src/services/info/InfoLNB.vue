<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocation } from 'vue-router';
import { useStore } from 'vuex';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

import { INFO_ROUTE } from '@/services/info/route-config';


const store = useStore();
const { t } = useI18n();

const state = reactive({
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.INFO].translationId)),
    menuSet: computed<LNBMenu[]>(() => {
        const allLnbMenu: LNBMenu[] = [
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.INFO_NOTICE].translationId),
                id: MENU_ID.INFO_NOTICE,
                to: { name: INFO_ROUTE.NOTICE._NAME } as RouteLocation,
            },
        ];
        return filterLNBMenuByPermission(allLnbMenu, store.getters['user/pagePermissionList']);
    }),
});

</script>

<template>
    <l-n-b :header="state.header"
           :menu-set="state.menuSet"
    />
</template>

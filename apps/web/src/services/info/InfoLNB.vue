<template>
    <l-n-b :header="header"
           :menu-set="menuSet"
    />
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import {
    filterLNBMenuByAccessPermission,
} from '@/lib/access-control/page-access-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

export default defineComponent({
    name: 'InfoLNB',
    components: { LNB },
    props: {},
    setup() {
        const state = reactive({
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.INFO].translationId)),
            menuSet: computed<LNBMenu[]>(() => {
                const allLnbMenu: LNBMenu[] = [
                    {
                        type: 'item',
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.NOTICE].translationId),
                        id: MENU_ID.NOTICE,
                        to: { name: INFO_ROUTE.NOTICE._NAME },
                    },
                ];
                return filterLNBMenuByAccessPermission(allLnbMenu, store.getters['user/pageAccessPermissionList']);
            }),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

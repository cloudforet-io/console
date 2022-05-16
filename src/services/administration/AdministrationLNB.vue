<template>
    <l-n-b :header="header" :menu-set="menuSet">
        <template #right-extra />
    </l-n-b>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
} from '@vue/composition-api';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { store } from '@/store';


export default defineComponent({
    name: 'AdministrationLNB',
    components: {
        LNB,
    },
    setup() {
        return {
            header: computed(() => MENU_INFO_MAP[MENU_ID.ADMINISTRATION].label),
            menuSet: computed<LNBMenu[]>(() => filterLNBMenuByPermission([
                {
                    type: 'title', label: 'IAM', id: MENU_ID.ADMINISTRATION_IAM, foldable: false,
                },
                {
                    type: 'item', label: 'User', id: MENU_ID.ADMINISTRATION_USER, to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
                },
                {
                    type: 'item', label: 'Role', id: MENU_ID.ADMINISTRATION_ROLE, to: { name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME },
                },
                {
                    type: 'item', label: 'Policy', id: MENU_ID.ADMINISTRATION_POLICY, to: { name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME },
                },
            ], store.getters['user/pagePermissionList'])),
        };
    },
});
</script>

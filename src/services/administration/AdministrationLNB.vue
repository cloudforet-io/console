<template>
    <l-n-b header="Administration" :menu-set="MenuSet">
        <template #right-extra />
    </l-n-b>
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { LNBMenu } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/menu/config';


const MenuSet: LNBMenu[] = [
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
];

export default defineComponent({
    name: 'AdministrationLNB',
    components: {
        LNB,
    },
    setup() {
        return {
            MenuSet,
        };
    },
});
</script>

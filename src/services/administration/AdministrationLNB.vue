<template>
    <l-n-b header="Administration" :menu-set="MenuSet" />
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { LNBItem } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';


const MenuSet: LNBItem[][] = [
    [
        {
            type: 'title', label: 'IAM', id: 'iam', foldable: false,
        },
        {
            type: 'item', label: 'User', id: 'user', to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
        },
    ],
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

<script lang="ts" setup>
import {
    computed,
    reactive, toRefs,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { store } from '@/store';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const { t } = useI18n();
const state = reactive({
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION].translationId)),
    menuSet: computed<LNBMenu[]>(() => [
        ...filterLNBMenuByPermission([
            {
                type: 'title',
                label: t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].translationId),
                id: MENU_ID.ADMINISTRATION_IAM,
                foldable: false,
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION_USER].translationId),
                id: MENU_ID.ADMINISTRATION_USER,
                to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION_ROLE].translationId),
                id: MENU_ID.ADMINISTRATION_ROLE,
                to: { name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME },
            },
            {
                type: 'item',
                label: t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION_POLICY].translationId),
                id: MENU_ID.ADMINISTRATION_POLICY,
                to: { name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME },
            },
        ], store.getters['user/pagePermissionList']),
    ]),
});

const { header, menuSet } = toRefs(state);

</script>

<template>
    <l-n-b :header="header"
           :menu-set="menuSet"
    >
        <template #right-extra />
    </l-n-b>
</template>

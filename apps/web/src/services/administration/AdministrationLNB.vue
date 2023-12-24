<template>
    <l-n-b :header="header"
           :menu-set="menuSet"
    >
        <template #right-extra />
    </l-n-b>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import {
    filterLNBMenuByAccessPermission,
} from '@/lib/access-control/page-access-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

export default defineComponent({
    name: 'AdministrationLNB',
    components: {
        LNB,
    },
    setup() {
        const appContextStore = useAppContextStore();
        const state = reactive({
            isAdminMode: computed(() => appContextStore.getters.isAdminMode),
            header: computed(() => (state.isAdminMode ? i18n.t(MENU_INFO_MAP[MENU_ID.ADMINISTRATION].translationId) : i18n.t(MENU_INFO_MAP[MENU_ID.IAM].translationId))),
            userModeMenuSet: computed<LNBMenu[]>(() => [
                {
                    type: 'item', label: i18n.t(MENU_INFO_MAP[MENU_ID.USER].translationId), id: MENU_ID.USER, to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
                },
                {
                    type: 'item', label: i18n.t(MENU_INFO_MAP[MENU_ID.APP].translationId), id: MENU_ID.APP, to: { name: ADMINISTRATION_ROUTE.IAM.APP._NAME },
                },
            ]),
            adminModeMenuSet: computed<LNBMenu[]>(() => [
                {
                    type: 'title', label: i18n.t(MENU_INFO_MAP[MENU_ID.IAM].translationId), id: MENU_ID.IAM, foldable: false,
                },
                {
                    type: 'item', label: i18n.t(MENU_INFO_MAP[MENU_ID.USER].translationId), id: MENU_ID.USER, to: { name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME) },
                },
                {
                    type: 'item', label: i18n.t(MENU_INFO_MAP[MENU_ID.ROLE].translationId), id: MENU_ID.ROLE, to: { name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE._NAME) },
                },
                {
                    type: 'item', label: i18n.t(MENU_INFO_MAP[MENU_ID.APP].translationId), id: MENU_ID.APP, to: { name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.APP._NAME) },
                },
                { type: 'divider' },
                {
                    type: 'title',
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.PREFERENCE].translationId),
                    id: MENU_ID.PREFERENCE,
                    foldable: false,
                },
                {
                    type: 'item',
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.DOMAIN_SETTINGS].translationId),
                    id: MENU_ID.DOMAIN_SETTINGS,
                    to: { name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME) },
                },
            ]),
            menuSet: computed<LNBMenu[]>(() => {
                if (state.isAdminMode) return state.adminModeMenuSet;
                return [
                    ...filterLNBMenuByAccessPermission(state.userModeMenuSet, store.getters['user/pageAccessPermissionList']),
                ];
            }),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

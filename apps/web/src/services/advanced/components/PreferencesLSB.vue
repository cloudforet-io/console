<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

import { ADVANCED_ROUTE } from '@/services/advanced/routes/route-constant';

const state = reactive({
    menuSet: computed<LSBItem[]>(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION'),
            to: { name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME) },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.DOMAIN_SETTINGS.APPEARANCE'),
            to: { name: makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.APPEARANCE._NAME) },
            hideFavorite: true,
        },
    ]),
});
</script>

<template>
    <l-s-b class="preferences-l-s-b"
           :menu-set="state.menuSet"
    />
</template>

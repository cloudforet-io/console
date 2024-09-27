<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const state = reactive({
    menuSet: computed<LSBItem[]>(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('COST_EXPLORER.ANOMALY_DETECTION_CONFIGURATION'),
            to: { name: makeAdminRouteName(COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME) },
            hideFavorite: true,
            highlightTag: 'new',
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('MENU.CURRENCY_CONVERTER'),
            to: { name: makeAdminRouteName(COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.CURRENCY_CONVERTER._NAME) },
            hideFavorite: true,
            highlightTag: 'new',
        },
    ]),
});
</script>

<template>
    <l-s-b class="cost-advanced-settings-l-s-b"
           :menu-set="state.menuSet"
    />
</template>

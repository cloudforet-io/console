<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const state = reactive({
    menuSet: computed<LSBItem[]>(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('MENU.COST_EXPLORER_ANOMALY_DETECTION'),
            to: { name: ADMIN_COST_EXPLORER_ROUTE.ANOMALY_DETECTION._NAME },
            highlightTag: MENU_INFO_MAP[MENU_ID.ANOMALY_DETECTION].highlightTag,
            hideFavorite: true,
        },
    ]),
});
</script>

<template>
    <l-s-b class="cost-anomaly-detection-l-s-b"
           :menu-set="state.menuSet"
    />
</template>

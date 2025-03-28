<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { i18n } from '@/translations';

import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const router = useRouter();

const containerName = ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS._NAME;

const state = reactive({
    childrenRoute: computed(() => router.getRoutes().filter((r) => r.name?.includes(containerName) && (r.name !== containerName))),
    menuSet: computed<LSBItem[]>(() => [
        ...state.childrenRoute.map((route) => ({
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t(route.meta?.translationId),
            to: { name: route.name },
            highlightTag: MENU_INFO_MAP[route.meta?.menuId].highlightTag,
            hideFavorite: true,
        })),
    ]),
});
</script>

<template>
    <l-s-b class="cost-advanced-settings-l-s-b"
           :menu-set="state.menuSet"
    />
</template>

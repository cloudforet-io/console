<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { MENU_ID } from '@/lib/menu/config.js';

import BookmarkLSB from '@/services/preference/components/BookmarkLSB.vue';
import DomainSettingsLSB from '@/services/preference/components/DomainSettingsLSB.vue';

const route = useRoute();

const state = reactive({
    menuId: computed<string>(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
});
</script>

<template>
    <fragment>
        <bookmark-l-s-b v-if="state.menuId === MENU_ID.BOOKMARK" />
        <domain-settings-l-s-b v-if="state.menuId === MENU_ID.DOMAIN_SETTINGS" />
    </fragment>
</template>

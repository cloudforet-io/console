<script setup lang="ts">
import { MENU_ID } from '@/lib/menu/config.js';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

import BookmarkLSB from '@/services/advanced/components/BookmarkLSB.vue';
import DomainSettingsLSB from '@/services/advanced/components/PreferencesLSB.vue';

const { currentMenuId } = useCurrentMenuId();
</script>

<template>
    <fragment>
        <bookmark-l-s-b v-if="currentMenuId === MENU_ID.BOOKMARK" />
        <domain-settings-l-s-b v-if="currentMenuId === MENU_ID.PREFERENCES" />
    </fragment>
</template>

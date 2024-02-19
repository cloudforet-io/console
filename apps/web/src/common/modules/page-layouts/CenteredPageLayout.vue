<template>
    <p-centered-layout class="centered-page-layout">
        <template v-if="!props.hasNavBar"
                  #top-contents
        >
            <top-bar-logo class="top-bar-logo"
                          :to="{ name: ROOT_ROUTE._NAME }"
            />
        </template>
        <template #default>
            <slot />
        </template>
    </p-centered-layout>
</template>

<script setup lang="ts">
import { PCenteredLayout } from '@spaceone/design-system';

import { ROOT_ROUTE } from '@/router/constant';

import TopBarLogo from '@/common/modules/navigations/top-bar/modules/TopBarLogo.vue';

interface Props {
    hasNavBar?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    hasNavBar: false,
});
</script>

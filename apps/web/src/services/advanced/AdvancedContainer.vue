<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import PreferenceLSB from '@/services/advanced/AdvancedLSB.vue';

const route = useRoute();

const state = reactive({
    lsbVisible: computed<boolean>(() => route.meta?.lsbVisible),
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="state.lsbVisible">
            <template #sidebar>
                <preference-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

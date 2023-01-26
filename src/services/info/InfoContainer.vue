<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <info-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import {
    defineComponent,
} from 'vue';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import InfoLNB from '@/services/info/InfoLNB.vue';
import { infoStore, infoStoreModule } from '@/services/info/store';
import type { InfoState } from '@/services/info/store/type';

export default defineComponent({
    name: 'InfoContainer',
    components: {
        InfoLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        registerServiceStore<InfoState>('info', infoStoreModule, infoStore);
        const { breadcrumbs } = useBreadcrumbs();

        /* Init */
        (async () => {
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {
            breadcrumbs,
        };
    },
});
</script>

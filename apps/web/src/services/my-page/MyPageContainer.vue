<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta?.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <my-page-l-n-b />
            </template>
            <router-view />
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

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import MyPageLNB from '@/services/my-page/MyPageLNB.vue';

export default defineComponent({
    name: 'MyPageContainer',
    components: {
        MyPageLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        return {
            breadcrumbs,
        };
    },
});

</script>

<template>
    <fragment>
        <general-page-layout>
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

export default defineComponent({
    name: 'InfoContainer',
    components: {
        GeneralPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();

        return {
            breadcrumbs,
        };
    },
});
</script>

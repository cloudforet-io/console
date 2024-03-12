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

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

export default defineComponent({
    name: 'PreferenceContainer',
    components: {
        GeneralPageLayout,
    },
});
</script>

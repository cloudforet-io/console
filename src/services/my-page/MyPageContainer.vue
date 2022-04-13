<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible">
            <template #sidebar>
                <my-page-l-n-b />
            </template>
            <router-view />
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { PDivider, PI } from '@spaceone/design-system';

import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import MyPageLNB from '@/services/my-page/MyPageLNB.vue';
import myPageStore from '@/services/my-page/store';

export default defineComponent({
    name: 'MyPageContainer',
    components: {
        MyPageLNB,
        GeneralPageLayout,
        VerticalPageLayout,
        PI,
        PDivider,
    },
    setup() {
        registerServiceStore('myPage', myPageStore);

        return {};
    },
});

</script>

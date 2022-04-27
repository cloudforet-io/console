<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
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
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import { PDivider, PI } from '@spaceone/design-system';

import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import MyPageLNB from '@/services/my-page/MyPageLNB.vue';
import myPageStore from '@/services/my-page/store';
import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const { breadcrumbs } = useBreadcrumbs(computed(() => vm.$route), [MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.MANAGE._NAME]);
        return {
            breadcrumbs,
        };
    },
});

</script>

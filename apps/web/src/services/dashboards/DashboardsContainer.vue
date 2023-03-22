<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <dashboards-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <!-- TODO: <centered-page-layout/> to be developed -->
        <div v-else-if="$route.meta.centeredLayout"
             class="centered-page-layout"
        >
            <p-icon-button
                class="go-back-button"
                name="ic_close"
                size="lg"
                @click="$router.go(-1)"
            />
            <div class="page-contents">
                <router-view />
            </div>
        </div>
        <!-- // centered-page-layout-->
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { PIconButton } from '@spaceone/design-system';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import DashboardsLNB from '@/services/dashboards/DashboardsLNB.vue';

export default {
    name: 'DashboardsContainer',
    components: {
        DashboardsLNB, GeneralPageLayout, VerticalPageLayout, PIconButton,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        return {
            breadcrumbs,
        };
    },
};
</script>
<style lang="postcss" scoped>
.centered-page-layout {
    @apply flex flex-col flex-grow;
    background: url('@/assets/images/img_blurred-background.png') no-repeat 50% -$gnb-height / 90rem auto;
    .go-back-button {
        @apply absolute;
        top: 0;
        right: 1.5rem;
    }
    .page-contents {
        @apply relative flex flex-col;
        margin: auto 0;
    }
}
</style>

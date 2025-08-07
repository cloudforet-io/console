<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import LandingContents from '@/services/landing/components/workspace-landing/LandingContents.vue';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceLandingPageQueryValue } from '@/services/landing/type/workspace-landing-page-type';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const landingPageStore = useLandingPageStore();
landingPageStore.setRedirectPath((route.query as WorkspaceLandingPageQueryValue).redirectPath);

const handleClickLogo = () => {
    router.push({ name: LANDING_ROUTE.DOMAIN._NAME });
};

const { key: workspacesQueryKey } = useServiceQueryKey('identity', 'user-profile', 'get-workspaces');
const { key: workspaceGroupsQueryKey } = useServiceQueryKey('identity', 'user-profile', 'get-workspace-groups');
onBeforeMount(() => {
    queryClient.invalidateQueries({ queryKey: workspacesQueryKey.value });
    queryClient.invalidateQueries({ queryKey: workspaceGroupsQueryKey.value });
});
</script>

<template>
    <div class="workspace-landing-page">
        <console-logo class="logo"
                      :position-fixed="false"
                      :is-hidden-if-tablet="false"
                      @click="handleClickLogo"
        />
        <landing-contents />
    </div>
</template>

<style scoped lang="postcss">
.workspace-landing-page {
    @apply flex flex-col items-center;
    .logo {
        @apply cursor-pointer;
        margin-top: 0.5rem;
        margin-left: -2rem;
    }
}
</style>

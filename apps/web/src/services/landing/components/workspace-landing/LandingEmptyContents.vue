<script setup lang="ts">
import Vue from 'vue';
import { useRouter } from 'vue-router/composables';

import { PEmpty, PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';

interface Props {
    isDomainAdmin: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDomainAdmin: false,
});

const appContextStore = useAppContextStore();

const router = useRouter();

const handleCreateWorkspace = () => {
    appContextStore.enterAdminMode();
    window.open(router.resolve({
        name: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME,
        query: {
            hasNoWorkspace: 'true',
        },
    }).href, '_blank');
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
};
</script>

<template>
    <p-empty
        show-image
        show-button
        class="landing-empty-contents"
    >
        <template #button>
            <p-button v-if="props.isDomainAdmin"
                      style-type="primary"
                      size="md"
                      icon-left="ic_plus_bold"
                      class="btn-create"
                      @click="handleCreateWorkspace"
            >
                {{ $t('LADING.CREATE_WORKSPACE') }}
            </p-button>
        </template>
        <div class="not-found">
            <p>{{ $t('LADING.NOT_FOUND_DESC') }}</p>
            <p v-if="props.isDomainAdmin">
                {{ $t('LADING.DESC_CREATE_WORKSPACE') }}
            </p>
        </div>
    </p-empty>
</template>

<style scoped lang="postcss">
.landing-empty-contents {
    padding-top: 1.5rem;
    .not-found {
        @apply flex flex-col text-paragraph-md text-gray-400;
    }
    .btn-create {
        margin-top: 1rem;
    }
}
</style>

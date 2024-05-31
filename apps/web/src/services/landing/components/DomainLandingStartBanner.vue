<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const router = useRouter();

const handleClickButton = (type: string) => {
    if (type === 'create') {
        window.open(router.resolve({
            name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
            query: {
                hasNoWorkspace: 'true',
            },
        }).href, '_blank');
    } else if (type === 'invite') {
        window.open(router.resolve({
            name: makeAdminRouteName(IAM_ROUTE.USER._NAME),
            query: {
                isAddUser: 'true',
            },
        }).href, '_blank');
    }
};
</script>

<template>
    <div class="domain-landing-start-banner">
        <div class="text-section section">
            <p class="title">
                {{ $t('LADING.DOMAIN.GET_STARTED_TITLE') }}
            </p>
            <span class="desc">{{ $t('LADING.DOMAIN.GET_STARTED_DESC') }}</span>
            <div class="buttons-wrapper">
                <p-button style-type="primary"
                          size="lg"
                          @click="handleClickButton('create')"
                >
                    {{ $t('LADING.DOMAIN.CREATE_WORKSPACE_BUTTON') }}
                </p-button>
                <p-button style-type="substitutive"
                          size="lg"
                          @click="handleClickButton('invite')"
                >
                    {{ $t('LADING.DOMAIN.INVITE_ADMINS') }}
                </p-button>
            </div>
        </div>
        <div class="image-wrapper">
            <img alt="get-started-illustration"
                 src="/images/domain-landing/domain-landing_admin_hero-image.png"
                 srcset="/images/domain-landing/domain-landing_admin_hero-image@2x.png 2x,
                        /images/domain-landing/domain-landing_admin_hero-image@3x.png 3x"
                 class="get-started-illustration"
            >
        </div>
    </div>
</template>

<style scoped lang="postcss">
.domain-landing-start-banner {
    @apply flex bg-violet-150 border border-violet-200;
    height: 18rem;
    padding: 2.5rem 2rem;
    border-radius: 0.375rem;
    .section {
        flex: 1;
    }
    .text-section {
        @apply flex flex-col;
        gap: 1rem;
        .title {
            @apply text-display-sm text-violet-900;
            max-width: 29.5rem;
        }
        .desc {
            @apply text-paragraph-lg text-gray-700;
            max-width: 40rem;
        }
        .buttons-wrapper {
            @apply flex;
            margin-top: 0.5rem;
            gap: 1rem;
        }
    }
    .image-wrapper {
        @apply flex justify-center items-end;
        flex: 1;
        .get-started-illustration {
            width: 28rem;
            height: 25rem;
            margin-bottom: -4.5rem;
        }
    }
}
</style>

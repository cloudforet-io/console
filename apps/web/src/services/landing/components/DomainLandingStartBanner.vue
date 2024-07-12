<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, screens, PTextButton } from '@cloudforet/mirinae';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const router = useRouter();

const { width } = useWindowSize();

const state = reactive({
    isTabletSize: computed(() => width.value < screens.tablet.max),
    isMobileSize: computed(() => width.value < screens.mobile.max),
});

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
            <span v-if="!state.isTabletSize"
                  class="desc"
            >{{ $t('LADING.DOMAIN.GET_STARTED_DESC') }}</span>
            <div class="buttons-wrapper">
                <div class="buttons">
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
                <p-text-button icon-left="ic_rocket-filled"
                               style-type="highlight"
                               class="workspace-button"
                               @click="router.push({ name: LANDING_ROUTE.WORKSPACE._NAME })"
                >
                    {{ $t('LADING.DOMAIN.EXPLORE_WORKSPACE_TITLE') }}
                </p-text-button>
            </div>
        </div>
        <div v-if="!state.isMobileSize"
             class="image-wrapper"
        >
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
    height: 19.5rem;
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
            @apply block text-paragraph-lg text-gray-700;
            max-width: 40rem;
            flex: 1;
        }
        .buttons-wrapper {
            @apply flex flex-col;
            gap: 1.5rem;
            .buttons {
                @apply flex items-end;
                gap: 1rem;
            }
            .workspace-button {
                @apply block text-left;
                padding: 0;
            }
        }
    }
    .image-wrapper {
        @apply flex justify-center items-end;
        flex: 1;
        .get-started-illustration {
            width: 28rem;
            height: 26.5rem;
            margin-bottom: -4.5rem;
        }
    }

    @screen laptop {
        height: 21rem;
    }

    @screen tablet {
        height: 19.25rem;
        .text-section {
            .title {
                flex: 1;
            }
            .buttons-wrapper {
                .buttons {
                    @apply block;
                    button {
                        @apply block;
                        & + button {
                            margin-top: 1rem;
                        }
                    }
                }
            }
        }
    }

    @screen mobile {
        height: 14rem;
        .text-section {
            .title {
                flex: 1;
            }
            .buttons-wrapper {
                .buttons {
                    @apply flex;
                    gap: 1rem;
                    button {
                        @apply block;
                        & + button {
                            margin-top: 1rem;
                        }
                    }
                }
            }
        }
    }

    @media (max-width: 478px) {
        height: 21rem;
        .text-section {
            .buttons-wrapper {
                .buttons {
                    @apply block;
                    button {
                        @apply block;
                        & + button {
                            margin-top: 1rem;
                        }
                    }
                }
            }
        }
    }
}
</style>

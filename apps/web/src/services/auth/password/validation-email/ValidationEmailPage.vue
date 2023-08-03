<template>
    <div class="validation-email-page">
        <div class="status-wrapper">
            <lottie-vue-player v-if="state.status === 'done'"
                               autoplay
                               src="/lottiefiles/lottie_done.json"
                               :style="{ height: '5rem', width: '5rem', backgroundColor: 'transparent' }"
            />
            <p-i v-else
                 name="ic_face-frown"
                 width="5rem"
                 height="5rem"
                 color="inherit"
                 class="face-icon"
            />
        </div>
        <div class="contents_wrapper">
            <div v-if="state.status === 'done'"
                 class="done"
            >
                <h1 v-if="!state.userId"
                    class="status-title"
                >
                    {{ $t('AUTH.PASSWORD.RESET.DONE') }}
                </h1>
                <div v-else>
                    <h1 class="status-title">
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.TITLE') }}
                    </h1>
                    <div class="desc_wrapper">
                        <p>
                            {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.DESC_1') }}
                            <span class="emphasis">{{ state.userId }}</span>
                        </p>
                        <p>
                            {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.DESC_2') }}
                        </p>
                    </div>
                </div>
            </div>
            <div v-else
                 class="failed"
            >
                <p class="status-title">
                    {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.TITLE') }}
                </p>
                <p class="desc_wrapper">
                    <span class="emphasis font-bold">
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.DESC_1') }}
                    </span>
                    {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.DESC_2') }}
                    <span class="emphasis">
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.DESC_3') }}
                    </span>
                    {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.DESC_4') }}
                </p>
            </div>
        </div>
        <div class="utils-wrapper">
            <div v-if="state.status === 'done'">
                <router-link :to="{ name: AUTH_ROUTE.SIGN_OUT._NAME }">
                    <p-button class="go-back-console-button">
                        {{ state.userId
                            ? $t('AUTH.PASSWORD.RESET.EMAIL.DONE.GO_BACK_TO_CONSOLE')
                            : $t('AUTH.PASSWORD.RESET.GO_TO_SIGN_IN')
                        }}
                    </p-button>
                </router-link>
                <div v-if="state.userId"
                     class="collapsible-wrapper"
                >
                    <p-collapsible-toggle v-if="state.isCollapsed"
                                          v-model="state.isCollapsed"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.COLLAPSED') }}
                    </p-collapsible-toggle>
                    <collapsible-contents v-else />
                </div>
            </div>
            <div v-else
                 class="go-back-wrapper"
            >
                <p-icon-button name="ic_arrow-left"
                               size="sm"
                               class="go-back-button mr-2"
                />
                <p class="go-back-button">
                    <router-link :to="{ name: AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME, query: {status: 'find'}}">
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.FAIL.GO_BACK') }}
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, watch } from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PButton, PCollapsibleToggle, PI, PIconButton,
} from '@spaceone/design-system';

import CollapsibleContents from '@/services/auth/password/validation-email/modules/CollapsibleContents.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';

const vm = getCurrentInstance()?.proxy as Vue;
const { status, userId } = vm.$route.query;

const state = reactive({
    isCollapsed: true,
    status: status as string,
    userId: userId as string,
});

watch(() => vm.$route.query.status, (res) => {
    state.status = res as string;
});
</script>

<style lang="postcss" scoped>
.validation-email-page {
    @apply flex flex-col items-center justify-center;
    gap: 1.5rem;
    width: 100%;
    height: 100%;
    .status-wrapper {
        .face-icon {
            @apply text-red-200;
        }
    }
    .contents_wrapper {
        @apply flex flex-col items-center justify-center text-center;
        .done {
            .status-title {
                @apply text-display-lg text-violet-800;
            }
            .desc_wrapper {
                @apply text-gray-700 text-paragraph-md text-center;
                margin-top: 0.75rem;
                .emphasis {
                    @apply font-bold;
                }
            }
        }
        .failed {
            .status-title {
                @apply text-display-md text-red-500;
            }
            .desc_wrapper {
                @apply text-paragraph-md text-gray-500;
                padding-top: 0.75rem;
                white-space: pre-line;
                .emphasis {
                    @apply text-gray-900;
                }
            }
        }
    }
    .utils-wrapper {
        .go-back-console-button {
            @apply flex items-center justify-center;
            margin: 1rem auto;
        }
        .go-back-wrapper {
            @apply flex items-center justify-center;

            /* custom design-system component - p-icon-button */
            :deep(.p-icon-button) {
                margin-right: 0.25rem;
            }
            .go-back-button {
                @apply text-blue-700 text-paragraph-md;
            }
        }
        .collapsible-wrapper {
            margin-top: 2.5rem;
        }
    }
}
</style>

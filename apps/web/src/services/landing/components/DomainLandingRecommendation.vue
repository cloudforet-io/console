<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PLink, PDivider, PCard, PButton,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

const CARD_TYPE = [
    {
        type: 'quick-start-guide',
        title: i18n.t('LADING.DOMAIN.QUICK_GUIDE_TITLE'),
        desc: i18n.t('LADING.DOMAIN.QUICK_GUIDE_DESC'),
        button: i18n.t('LADING.DOMAIN.QUICK_GUIDE_BUTTON'),
        to: '',
        image: '/images/domain-landing/domain-landing_admin_quick-start-guide.png',
        srcSet: '/images/domain-landing/domain-landing_admin_quick-start-guide@2x.png 2x, /images/domain-landing/domain-landing_admin_quick-start-guide@3x.png 3x',
    },
    {
        type: 'role-type',
        title: i18n.t('LADING.DOMAIN.ROLE_TYPE_TITLE'),
        desc: i18n.t('LADING.DOMAIN.ROLE_TYPE_DESC'),
        button: i18n.t('LADING.DOMAIN.ROLE_TYPE_BUTTON'),
        to: '',
        image: '/images/domain-landing/domain-landing_admin_role-type.png',
        srcSet: '/images/domain-landing/domain-landing_admin_role-type@2x.png 2x, /images/domain-landing/domain-landing_admin_role-type@3x.png 3x',
    },
    {
        type: 'auto-sync',
        title: i18n.t('LADING.DOMAIN.AUTO_SYNC_TITLE'),
        desc: i18n.t('LADING.DOMAIN.AUTO_SYNC_DESC'),
        button: i18n.t('LADING.DOMAIN.AUTO_SYNC_BUTTON'),
        to: '',
        image: '/images/domain-landing/domain-landing_admin_auto-sync.png',
        srcSet: '/images/domain-landing/domain-landing_admin_auto-sync@2x.png 2x, /images/domain-landing/domain-landing_admin_auto-sync@3x.png 3x',
    },
];
const storeState = reactive({
    language: computed(() => store.state.user.language),
});
</script>

<template>
    <div class="domain-landing-recommendation">
        <h2>{{ $t('LADING.DOMAIN.RECOMMENDED_TITLE') }}</h2>
        <p-link :text="i18n.t('LADING.DOMAIN.HELP_LINK')"
                :href="`https://help.spaceone.megazone.com/hc/${storeState.language}`"
                size="md"
                highlight
                action-icon="external-link"
                new-tab
                class="help-link"
        />
        <p-divider class="divider" />
        <div class="card-wrapper">
            <p-card v-for="(item, idx) in CARD_TYPE"
                    :key="`p-card-${idx}`"
                    :header="false"
                    class="card"
            >
                <div class="card-inner-wrapper">
                    <div class="inner-contents">
                        <p class="title">
                            {{ item.title }}
                        </p>
                        <span class="desc">{{ item.desc }}</span>
                        <p-button style-type="tertiary"
                                  :icon-left="item.type === 'quick-start-guide' ? 'ic_rocket-filled' : undefined"
                                  class="link-button"
                        >
                            <p-link :text="item.button"
                                    :to="item.to"
                                    size="sm"
                                    :action-icon="item.type === 'quick-start-guide' ? 'external-link' : undefined"
                                    new-tab
                            />
                        </p-button>
                    </div>
                    <img class="card-image"
                         :src="item.image"
                         :srcset="item.srcSet"
                         alt="card-image"
                    >
                </div>
            </p-card>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.domain-landing-recommendation {
    @apply flex flex-col;
    gap: 0.375rem;
    .help-link {
        margin-left: auto;
    }
    .divider {
        margin-top: 0.375rem;
    }
    .card-wrapper {
        @apply flex;
        padding-top: 0.875rem;
        gap: 1rem;

        .card {
            @apply relative;
            flex: 1;
            .card-inner-wrapper {
                padding: 3.625rem 1.125rem;
                .inner-contents {
                    z-index: 1;
                    .title {
                        @apply text-label-xl font-medium;
                    }
                    .desc {
                        @apply block text-paragraph-md;
                        max-width: 13rem;
                        margin-top: 0.75rem;
                    }
                    .link-button {
                        margin-top: 1.5rem;
                    }
                }
                .card-image {
                    @apply absolute;
                    top: 0;
                    right: 0;
                }
            }
        }
    }
}
</style>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PPaneLayout, PFieldTitle, PTextInput, PButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { usePreferencesStore } from '@/store/preferences/preferences-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


const router = useRouter();
const domainConfigStore = usePreferencesStore();
const domainConfigGetters = domainConfigStore.getters;

const state = reactive({
    isChanged: computed<boolean>(() => {
        if ([state.wordtypeLogoUrl, state.symbolFaviconUrl, state.loginPageImageUrl, state.displayName,
            domainConfigGetters.wordtypeLogoUrl, domainConfigGetters.symbolFaviconUrl, domainConfigGetters.loginPageImageUrl, domainConfigGetters.displayName]
            .every((d) => !d)) return false;
        return (state.wordtypeLogoUrl !== domainConfigGetters.wordtypeLogoUrl)
            || (state.symbolFaviconUrl !== domainConfigGetters.symbolFaviconUrl)
            || (state.loginPageImageUrl !== domainConfigGetters.loginPageImageUrl)
            || (state.displayName !== domainConfigGetters.displayName);
    }),
    displayName: undefined as string | undefined,
    wordtypeLogoUrl: undefined as string | undefined,
    symbolFaviconUrl: undefined as string | undefined,
    loginPageImageUrl: undefined as string | undefined,
});

/* Event */
const handleSaveChanges = async () => {
    try {
        await domainConfigStore.updatePreferences({
            display_name: state.displayName,
            wordtype_logo_url: state.wordtypeLogoUrl,
            symbol_favicon_url: state.symbolFaviconUrl,
            login_page_image_url: state.loginPageImageUrl,
        });
        router.go(0);
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_UPDATE_BRAND_ASSETS'));
    }
};

/* Watcher */
watch(() => domainConfigGetters.displayName, (val) => {
    state.displayName = val;
}, { immediate: true });
watch(() => domainConfigGetters.wordtypeLogoUrl, (val) => {
    state.wordtypeLogoUrl = val;
}, { immediate: true });
watch(() => domainConfigGetters.symbolFaviconUrl, (val) => {
    state.symbolFaviconUrl = val;
}, { immediate: true });
watch(() => domainConfigGetters.loginPageImageUrl, (val) => {
    state.loginPageImageUrl = val;
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="admin-domain-setting-brand-assets-page">
        <div class="content-wrapper">
            <div class="field-wrapper">
                <div class="left-part">
                    <p-field-title label="Display Name" />
                    <p-text-input :value.sync="state.displayName"
                                  :placeholder="domainConfigGetters.displayName"
                    />
                    <div class="description">
                        {{ $t('IAM.DOMAIN_SETTINGS.DOMAIN_NAME_IMAGE_DESCRIPTION') }}
                    </div>
                </div>
                <div class="right-part">
                    <img src="@/assets/images/domain-settings/display_name_example_min.png"
                         alt="Domain Name image sample"
                    >
                </div>
            </div>
            <div class="field-wrapper">
                <div class="left-part">
                    <p-field-title label="Wordtype Logo URL" />
                    <p-text-input :value.sync="state.wordtypeLogoUrl" />
                    <div class="description">
                        {{ $t('IAM.DOMAIN_SETTINGS.WORDTYPE_LOGO_DESCRIPTION') }}
                    </div>
                </div>
                <div class="right-part">
                    <img src="@/assets/images/domain-settings/wordtype_logo_url.png"
                         alt="Wordtype logo image sample"
                    >
                </div>
            </div>
            <div class="field-wrapper">
                <div class="left-part">
                    <p-field-title label="Symbol & Favicon URL" />
                    <p-text-input :value.sync="state.symbolFaviconUrl" />
                    <div class="description">
                        {{ $t('IAM.DOMAIN_SETTINGS.SYMBOL_FAVICON_DESCRIPTION') }}
                    </div>
                </div>
                <div class="right-part">
                    <img src="@/assets/images/domain-settings/symbol_favicon_url.png"
                         alt="Symbol & Favicon image sample"
                    >
                </div>
            </div>
            <div class="field-wrapper">
                <div class="left-part">
                    <p-field-title label="Sign In Page Main Image URL" />
                    <p-text-input :value.sync="state.loginPageImageUrl" />
                    <div class="description">
                        {{ $t('IAM.DOMAIN_SETTINGS.SIGN_IN_PAGE_MAIN_IMAGE_DESCRIPTION') }}
                    </div>
                </div>
                <div class="right-part">
                    <img src="@/assets/images/domain-settings/login_page_main_image_url.png"
                         alt="Symbol & Favicon image sample"
                    >
                </div>
            </div>
        </div>
        <p-button :disabled="!state.isChanged"
                  class="save-button"
                  @click="handleSaveChanges"
        >
            {{ $t('IAM.DOMAIN_SETTINGS.SAVE_CHANGES') }}
        </p-button>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-setting-brand-assets-page {
    .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1rem;
        .field-wrapper {
            @apply grid grid-cols-12;
            gap: 1rem;
            .left-part {
                @apply col-span-8;
                .description {
                    @apply text-paragraph-md text-gray-500;
                    white-space: pre-line;
                    line-height: 1.5;
                }
                .p-field-title {
                    padding-bottom: 0.25rem;
                }
                .p-text-input {
                    width: 100%;
                }
            }
            .right-part {
                @apply col-span-4 bg-gray-100 rounded-md;
                padding: 1.25rem;
            }
        }
    }
    .save-button {
        margin: 1.25rem 1rem;
    }
}
</style>

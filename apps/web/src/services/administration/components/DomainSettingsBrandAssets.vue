<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PHeading, PPaneLayout, PFieldTitle, PTextInput, PButton,
} from '@spaceone/design-system';


const state = reactive({
    isChanged: false,
    wordtypeLogoUrl: '',
    symbolFaviconUrl: '',
    loginPageImageUrl: '',
});

/* Event */
const handleSaveChanges = () => {
    // TODO: save changes
};
</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="$t('IAM.DOMAIN_SETTINGS.BRAND_ASSETS')"
        />
        <div class="content-wrapper">
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
                    <p-field-title label="Login Page Main Image URL" />
                    <p-text-input :value.sync="state.loginPageImageUrl" />
                    <div class="description">
                        {{ $t('IAM.DOMAIN_SETTINGS.LOGIN_PAGE_MAIN_IMAGE_DESCRIPTION') }}
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
</style>

<script lang="ts" setup>
import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { PButtonModal, PCheckbox } from '@spaceone/design-system';
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const state = reactive({
    isVisible: true,
    isSelected: false,
    browserList: computed(() => [
        { label: t('APP.MODAL.RECOMMEND_BROWSER.CHROME'), img: 'images/support-browsers/ic_chrome_2x.png', link: 'https://www.google.com/chrome' },
        { label: t('APP.MODAL.RECOMMEND_BROWSER.EDGE'), img: 'images/support-browsers/ic_edge_2x.png', link: 'https://www.microsoft.com/edge' },
    ]),
});
const handleCloseModal = () => {
    if (state.isSelected) LocalStorageAccessor.setItem('showBrowserRecommendation', 'showBrowserRecommendation');
    state.isVisible = false;
};

</script>

<template>
    <p-button-modal class="recommended-browser-modal"
                    :hide-header-close-button="true"
                    :hide-footer-close-button="true"
                    :visible="state.isVisible"
                    :header-title="t('APP.MODAL.RECOMMEND_BROWSER.HEADER')"
                    size="sm"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div class="browser-icon-wrapper">
                <a v-for="(browser, idx) in state.browserList"
                   :key="idx"
                   class="browser-icon-container"
                   :href="browser.link"
                   target="_blank"
                >
                    <img class="browser-img"
                         :src="browser.img"
                    >
                    <span class="browser-name">{{ browser.label }}</span>
                </a>
            </div>
            <p class="recommend-browser-help-text">
                {{ t('APP.MODAL.RECOMMEND_BROWSER.BODY_HELP_TEXT') }}
            </p>
        </template>
        <template #footer-extra>
            <div>
                <p-checkbox v-model:selected="state.isSelected">
                    {{ t('APP.MODAL.RECOMMEND_BROWSER.DO_NOT_SHOW_AGAIN') }}
                </p-checkbox>
            </div>
        </template>
        <template #confirm-button>
            {{ t('APP.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.recommended-browser-modal {
    .browser-icon-wrapper {
        @apply flex flex-wrap gap-2;
        margin-top: 2rem;
        margin-bottom: 1rem;
        .browser-icon-container {
            @apply bg-gray-100 rounded-2xl flex flex-col items-center flex-wrap gap-2;
            padding: 1.5rem 0;
            width: calc(50% - 0.25rem);

            .browser-img {
                width: 4rem;
            }
            .browser-name {
                @apply text-gray-500;
            }

            &:hover {
                @apply bg-blue-200 cursor-pointer;
                .browser-name {
                    text-decoration: underline;
                }
            }
        }
    }
    .recommend-browser-help-text {
        line-height: 150%;
    }
}

/* custom design-system component - p-button-modal */
:deep(.p-button-modal) {
    .modal-mask {
        .modal-header {
            height: unset;
        }
        .modal-body {
            max-height: unset;
            overflow: unset;
        }
    }
}

@screen mobile {
    .recommended-browser-modal {
        .browser-icon-wrapper {
            .browser-icon-container {
                .browser-img {
                    width: 2rem;
                }
            }
        }
    }
}
</style>

<script lang="ts" setup>

import { PButtonModal } from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const state = reactive({
    isVisible: true,
});
const handleCloseModal = () => {
    state.isVisible = false;
    router.push({ name: 'AUTH_ROUTE.SIGN_IN._NAME' });
};

</script>

<template>
    <p-button-modal class="mobile-guide-modal"
                    :hide-header-close-button="true"
                    :hide-footer-close-button="true"
                    :visible="state.isVisible"
                    :header-title="t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_TITLE')"
                    size="sm"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div class="description">
                {{ t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_1') }}
                <strong>{{ t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_2') }}</strong>
                {{ t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_3') }}
            </div>
        </template>
        <template #confirm-button>
            {{ t('APP.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.mobile-guide-modal {
    .description {
        padding: 1rem 0;
    }
}
</style>

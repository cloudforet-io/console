<template>
    <p-button-modal class="mobile-guide-modal"
                    :hide-header-close-button="true"
                    :hide-footer-close-button="true"
                    :visible="isVisible"
                    :header-title="$t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_TITLE')"
                    size="sm"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div class="description">
                {{ $t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_1') }}
                <strong>{{ $t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_2') }}</strong>
                {{ $t('AUTH.PASSWORD.MOBILE.MOBILE_GUIDE_MODAL_DESC_3') }}
            </div>
        </template>
        <template #confirm-button>
            {{ $t('APP.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

export default {
    name: 'MobileGuideModal',
    components: {
        PButtonModal,
    },
    setup() {
        const state = reactive({
            isVisible: true,
        });
        const handleCloseModal = () => {
            state.isVisible = false;
            SpaceRouter.router.push({ name: 'AUTH_ROUTE.SIGN_IN._NAME' });
        };
        return {
            ...toRefs(state),
            handleCloseModal,
        };
    },
};
</script>

<style scoped>
.mobile-guide-modal {
    .description {
        padding: 1rem 0;
    }
}
</style>

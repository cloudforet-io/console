<template>
    <div class="cloud-service-history-detail">
        <p-pane-layout class="page-wrapper">
            <p-page-title title="History Details" child @goBack="handleGoBack" />
        </p-pane-layout>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import {
    PPaneLayout, PPageTitle,
} from '@spaceone/design-system';

export default defineComponent({
    name: 'CloudServiceHistoryDetail',
    components: {
        PPaneLayout,
        PPageTitle,
    },
    props: {},
    setup(props, { emit }) {
        /* Event */
        const handleGoBack = () => {
            emit('close');
        };

        return {
            handleGoBack,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-history-detail {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    flex-direction: column;
    z-index: 99;

    /* transition: opacity 0.3s ease; */
    max-height: 100%;
    min-height: 100%;
    max-width: 100vw;

    .page-wrapper {
        width: 100%;
        border: none;
        flex-grow: 1;
        padding: 1.5rem;
    }
}
</style>

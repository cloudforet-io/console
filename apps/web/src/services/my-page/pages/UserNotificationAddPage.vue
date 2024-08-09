<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { queryStringToString } from '@/lib/router-query-string';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';

const route = useRoute();
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    pageTitle: computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel })),
    protocolId: computed(() => route.params.protocolId),
    protocolType: computed(() => route.query.protocolType),
    protocolLabel: asyncComputed<string>(async () => {
        const labelFromQuery = queryStringToString(route.query?.protocolLabel);
        if (labelFromQuery) return labelFromQuery;
        const protocols = allReferenceStore.getters.protocol;
        return protocols[state.protocolId]?.label;
    }, '', { lazy: true, onError: (e) => console.error(e) }),
});
</script>

<template>
    <div>
        <p-heading show-back-button
                   :title="state.pageTitle"
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        />
        <notification-add-form :protocol-id="state.protocolId"
                               :protocol-type="state.protocolType"
        />
    </div>
</template>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>

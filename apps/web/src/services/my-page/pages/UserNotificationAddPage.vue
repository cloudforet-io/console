<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading } from '@cloudforet/mirinae';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { i18n } from '@/translations';

import { queryStringToString } from '@/lib/router-query-string';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';

const route = useRoute();

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    pageTitle: computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel })),
    protocolId: computed(() => route.params.protocolId),
    protocolType: computed(() => route.query.protocolType),
    protocolLabel: asyncComputed<string>(async () => {
        const labelFromQuery = queryStringToString(route.query?.protocolLabel);
        if (labelFromQuery) return labelFromQuery;
        return referenceMap.protocol[state.protocolId]?.label || state.protocolId;
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
    @apply mb-6;
    text-transform: capitalize;
}
</style>

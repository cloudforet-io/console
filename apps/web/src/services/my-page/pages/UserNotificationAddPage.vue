<script setup lang="ts">
import {
    computed, onActivated, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { queryStringToString } from '@/lib/router-query-string';

import NotificationAddForm from '@/services/my-page/components/NotificationAddForm.vue';


const route = useRoute();

const state = reactive({
    protocolLabel: '' as string,
    pageTitle: computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: state.protocolLabel })),
    protocolId: computed(() => route.params.protocolId),
    protocolType: computed(() => route.query.protocolType),
});

(async () => {
    state.protocolLabel = queryStringToString(route.query?.protocolLabel);
})();

onActivated(() => {
    state.protocolLabel = queryStringToString(route.query?.protocolLabel);
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

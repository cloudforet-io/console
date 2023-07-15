<script lang="ts" setup>
import { PHeading } from '@spaceone/design-system';
import {
    computed, onActivated, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import NotificationAddForm from '@/services/notification/notification-add/modules/NotificationAddForm.vue';



const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const state = reactive({
    pageTitle: '',
    //
    userId: decodeURIComponent(route.params.userId as string),
    protocolId: computed(() => route.params.protocolId),
    protocolType: computed(() => route.query.protocolType),
    supportedSchema: computed(() => route.query.supported_schema),
});

(async () => {
    const protocolLabel = decodeURIComponent(route.query?.protocolLabel as any);
    state.pageTitle = computed(() => t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as string;
})();

onActivated(() => {
    const protocolLabel = decodeURIComponent(route.query?.protocolLabel as any);
    state.pageTitle = computed(() => t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as string;
});

</script>

<template>
    <div>
        <p-heading show-back-button
                   :title="state.pageTitle"
                   class="page-title"
                   @click-back-button="router.go(-1)"
        />
        <notification-add-form :protocol-id="state.protocolId"
                               :protocol-type="state.protocolType"
                               :supported-schema="state.supportedSchema"
                               :user-id="state.userId"
        />
    </div>
</template>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>

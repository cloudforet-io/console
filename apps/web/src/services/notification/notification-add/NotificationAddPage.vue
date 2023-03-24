<template>
    <div>
        <p-heading show-back-button
                   :title="pageTitle"
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        />
        <notification-add-form :protocol-id="protocolId"
                               :protocol-type="protocolType"
                               :supported-schema="supportedSchema"
                               :user-id="userId"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onActivated, reactive, toRefs,
} from 'vue';
import VueI18n from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import { PHeading } from '@spaceone/design-system';

import { i18n } from '@/translations';

import NotificationAddForm from '@/services/notification/notification-add/modules/NotificationAddForm.vue';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'NotificationAddPage',
    components: {
        NotificationAddForm,
        PHeading,
    },

    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            pageTitle: '' as TranslateResult,
            //
            userId: decodeURIComponent(vm.$route.params.userId),
            protocolId: computed(() => vm.$route.params.protocolId),
            protocolType: computed(() => vm.$route.query.protocolType),
            supportedSchema: computed(() => vm.$route.query.supported_schema),
        });

        (async () => {
            const protocolLabel = decodeURIComponent(vm.$route.query?.protocolLabel as any);
            state.pageTitle = computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
        })();

        onActivated(() => {
            const protocolLabel = decodeURIComponent(vm.$route.query?.protocolLabel as any);
            state.pageTitle = computed(() => i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: protocolLabel })) as unknown as TranslateResult;
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.page-title {
    text-transform: capitalize;
}
</style>

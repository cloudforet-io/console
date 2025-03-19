<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButtonModal, PDefinitionTable } from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const router = useRouter();


const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    service: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    fields: computed<DefinitionField[]>(() => [
        { name: 'alerts', label: i18n.t('ALERT_MANAGER.ALERTS.TITLE') },
        { name: 'webhook', label: i18n.t('ALERT_MANAGER.WEBHOOK.TITLE') },
    ]),
    data: computed(() => ({
        alerts: storeState.service.alerts.TOTAL.HIGH + storeState.service.alerts.TOTAL.LOW,
        webhook: storeState.service.webhooks?.length || 0,
    })),
    noData: computed<boolean>(() => state.data.alerts === 0 && state.data.webhook === 0),
});
const handleConfirm = async () => {
    state.loading = true;
    try {
        await serviceDetailPageStore.deleteServiceDetailData();
        await router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_DELETE_SERVICE'), '');
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal class="service-detail-delete-modal"
                    :header-title="!state.noData ? $t('ALERT_MANAGER.SERVICE.MODAL_DELETE_TITLE') : $t('ALERT_MANAGER.SERVICE.MODAL_DELETE_NO_DATA')"
                    size="sm"
                    theme-color="alert"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template v-if="!state.noData"
                  #body
        >
            <div class="flex flex-col gap-2 pt-4 pb-2">
                <span>{{ $t('ALERT_MANAGER.SERVICE.MODAL_DELETE_DESC') }}</span>
                <p-definition-table v-if="!state.noData"
                                    :fields="state.fields"
                                    :data="state.data"
                                    :skeleton-rows="2"
                                    class="definition-table"
                                    custom-key-width="50%"
                                    disable-copy
                />
            </div>
        </template>
        <template v-if="state.noData"
                  #confirm-button
        >
            {{ $t('COMMON.BUTTONS.DELETE') }}
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.service-detail-delete-modal {
    .definition-table {
        min-height: unset;
    }
}
</style>

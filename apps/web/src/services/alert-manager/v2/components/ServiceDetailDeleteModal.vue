<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PDefinitionTable } from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import type { ServiceDeleteParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceGetQuery } from '@/services/alert-manager/v2/composables/use-service-get-query';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const router = useRouter();
const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const { serviceData } = useServiceGetQuery(serviceId);

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    fields: computed<DefinitionField[]>(() => [
        { name: 'alerts', label: i18n.t('ALERT_MANAGER.ALERTS.TITLE') },
        { name: 'webhook', label: i18n.t('ALERT_MANAGER.WEBHOOK.TITLE') },
    ]),
    data: computed(() => ({
        alerts: (serviceData.value?.alerts?.TOTAL.HIGH || 0) + (serviceData.value?.alerts?.TOTAL.LOW || 0),
        webhook: serviceData.value?.webhooks?.length || 0,
    })),
    noData: computed<boolean>(() => state.data.alerts === 0 && state.data.webhook === 0),
});

const queryClient = useQueryClient();
const { serviceAPI } = useServiceApi();
const { key: serviceListBaseQueryKey } = useServiceQueryKey('alert-manager', 'service', 'list');
const { mutate: deleteService, isPending: deleteServiceLoading } = useMutation({
    mutationFn: (params: ServiceDeleteParameters) => serviceAPI.delete(params),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: serviceListBaseQueryKey.value });
        await router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_DELETE_SERVICE'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});
const handleConfirm = async () => {
    deleteService({
        service_id: serviceId.value,
        force: true,
    });
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
                    :loading="deleteServiceLoading"
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

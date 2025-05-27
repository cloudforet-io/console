<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

interface Props {
    visible: boolean;
    alertId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    alertId: '',
});

const router = useRouter();
const route = useRoute();

const { alertAPI } = useAlertApi();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const queryClient = useQueryClient();
const { key: alertListBaseQueryKey } = useServiceQueryKey('alert-manager', 'alert', 'list');

const handleClose = () => {
    state.proxyVisible = false;
};

const { mutate: alertDeleteMutate, isPending: alertDeleteLoading } = useMutation({
    mutationFn: alertAPI.delete,
    onSuccess: async () => {
        const serviceId = route.params?.serviceId;
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_DELETE'), '');
        queryClient.invalidateQueries({ queryKey: alertListBaseQueryKey });
        if (serviceId) {
            await router.go(-1);
        } else {
            await router.push({ name: ALERT_MANAGER_ROUTE.ALERTS._NAME }).catch(() => {});
        }
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});
const handleConfirm = () => {
    alertDeleteMutate({
        alert_id: props.alertId,
    });
};
</script>

<template>
    <p-button-modal class="alert-detail-delete-modal"
                    :header-title="$t('ALERT_MANAGER.ALERTS.MODAL_DELETE_ALERT')"
                    size="sm"
                    theme-color="alert"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :loading="alertDeleteLoading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    />
</template>

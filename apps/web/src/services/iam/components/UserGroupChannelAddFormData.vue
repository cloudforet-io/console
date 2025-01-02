<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PJsonSchemaForm } from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/inputs/forms/json-schema-form/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const emit = defineEmits<{(e: 'update-valid', valid: boolean): void}>();

const userStore = useUserStore();

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

interface ChannelState {
  schemaForm: Record<string, any>;
  schema: JsonSchema | null;
  isSchemaFormValid: boolean;
  isJsonSchema: ComputedRef<boolean>;
  isDataValid: ComputedRef<boolean>;
}

const storeState = reactive({
    protocolId: computed<string>(() => notificationChannelCreateFormState.selectedProtocol.protocol_id),
    language: computed<string | undefined>(() => userStore.state.language),
});

const state = reactive<ChannelState>({
    schemaForm: {},
    schema: null,
    isSchemaFormValid: false,
    isJsonSchema: computed<boolean>((): boolean => (state.schema ? Object.keys(state.schema).length !== 0 : false)),
    isDataValid: computed<boolean>(() => (!state.isJsonSchema && !state.isNameInvalid)),
});

const apiQuery = new ApiQueryHelper();
const getSchema = async (): Promise<JsonSchema | null> => {
    try {
        apiQuery.setFilters([{ k: 'protocol_id', v: storeState.protocolId, o: '=' }]);
        const res = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>({
            query: apiQuery.data,
        });
        return res.results?.[0]?.plugin_info.metadata.data.schema ?? {};
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return null;
    }
};

/* Watcher */
watch(() => storeState.protocolId, async (nv_selected_protocol) => {
    if (!nv_selected_protocol) return;
    state.schema = await getSchema();
}, { deep: true, immediate: true });

watch(() => state.schemaForm, (nv_schema_form) => {
    if (nv_schema_form) {
        notificationChannelCreateFormStore.$patch((_state) => {
            _state.state.protocolSchemaForm = nv_schema_form;
        });
    }
}, { immediate: true });

/* Component */
const handleSchemaValidate = (isValid: boolean) => {
    state.isSchemaFormValid = isValid;
};

const handleSchemaFormChange = (isValid, form) => {
    state.isSchemaFormValid = isValid;
    state.schemaForm = form;

    emit('update-valid', isValid);
};
</script>

<template>
    <div>
        <p-json-schema-form v-if="state.isJsonSchema"
                            :key="storeState.protocolId"
                            :form-data="state.schemaForm"
                            :schema="state.schema"
                            :language="storeState.language"
                            uniform-width
                            @validate="handleSchemaValidate"
                            @change="handleSchemaFormChange"
        />
    </div>
</template>

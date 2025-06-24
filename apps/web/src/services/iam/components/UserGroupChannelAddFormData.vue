<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import { computed, reactive, watch } from 'vue';

import { PJsonSchemaForm } from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import { useUserStore } from '@/store/user/user-store';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const emit = defineEmits<{(e: 'update-valid', valid: boolean): void}>();

const userStore = useUserStore();

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

interface Props {
  schema: JsonSchema;
}

interface ChannelState {
  schemaForm: Record<string, any>;
  isSchemaFormValid: boolean;
  isJsonSchema: ComputedRef<boolean>;
  isDataValid: ComputedRef<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
    schema: () => ({}),
});

const storeState = reactive({
    protocolId: computed<string>(() => notificationChannelCreateFormState.selectedProtocol.protocol_id),
    language: computed<string | undefined>(() => userStore.state.language),
});

const state = reactive<ChannelState>({
    schemaForm: {},
    isSchemaFormValid: false,
    isJsonSchema: computed<boolean>((): boolean => (props.schema ? Object.keys(props.schema).length !== 0 : false)),
    isDataValid: computed<boolean>(() => (!state.isJsonSchema && !state.isNameInvalid)),
});

/* Watcher */
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
                            :schema="props.schema"
                            :language="storeState.language"
                            uniform-width
                            @validate="handleSchemaValidate"
                            @change="handleSchemaFormChange"
        />
    </div>
</template>

<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDynamicLayout } from '@spaceone/design-system';
import { cloneDeep, isEmpty } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';


import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import ErrorHandler from '@/common/composables/error/errorHandler';

const EXCLUDED_FIELD_KEYS = ['project_info.project_id', 'created_at', 'service_account_type'];

interface Props {
    provider?: string;
    serviceAccountData?: Record<string, any>;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    provider: undefined,
    serviceAccountData: undefined,
    loading: false,
});

const state = reactive({
    detailSchema: {},
    convertedDetailSchema: computed(() => {
        const result = cloneDeep(state.detailSchema);
        if (!isEmpty(result)) {
            result.options.fields = state.detailSchema?.options?.fields.filter((d) => !EXCLUDED_FIELD_KEYS.includes(d.key));
        }
        return result;
    }),
});

/* Util */
const fieldHandler = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter(field.extraData.reference, field.data);
    }
    return {};
};

/* Api */
const getDetailSchema = async (provider) => {
    try {
        const result = await SpaceConnector.client.addOns.pageSchema.get({
            resource_type: 'identity.ServiceAccount',
            schema: 'details',
            options: {
                provider,
            },
        });
        state.detailSchema = result.details[0];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.detailSchema = {};
    }
};

/* Watcher */
watch(() => props.provider, (provider) => {
    if (provider) getDetailSchema(provider);
});

</script>

<template>
    <div class="service-account-base-information-detail">
        <p-dynamic-layout :type="state.convertedDetailSchema.type"
                          :options="state.convertedDetailSchema.options"
                          :data="serviceAccountData"
                          :type-options="{
                              loading: !state.convertedDetailSchema.type || loading
                          }"
                          :field-handler="fieldHandler"
        />
    </div>
</template>

<style lang="postcss" scoped>
.service-account-base-information-detail {
    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        display: none;
    }
}
</style>

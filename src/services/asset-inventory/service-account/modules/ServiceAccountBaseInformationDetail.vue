<template>
    <div class="service-account-base-information-detail">
        <p-dynamic-layout v-if="detailSchema"
                          v-bind="detailSchema"
                          :data="serviceAccountData"
                          :field-handler="fieldHandler"
        />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, watch,
} from 'vue';

import {
    PDynamicLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from 'cloudforet/core-lib/space-connector';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import ErrorHandler from '@/common/composables/error/errorHandler';


export default {
    name: 'ServiceAccountBaseInformationDetail',
    components: {
        PDynamicLayout,
    },
    props: {
        provider: {
            type: String,
            default: undefined,
        },
        serviceAccountData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            detailSchema: {},
            fieldHandler: [],
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

        return {
            ...toRefs(state),
            fieldHandler,
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-account-base-information-detail {
    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-panel-top */
    :deep(.p-panel-top) {
        display: none;
    }
}
</style>

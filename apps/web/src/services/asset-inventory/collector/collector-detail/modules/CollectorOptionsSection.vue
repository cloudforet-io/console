<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_OPTIONS')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button v-if="!state.isEditMode"
                          size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                          @click="handleClickEdit"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
        <p-definition-table v-if="!state.isEditMode"
                            :fields="state.fields"
                            :loading="state.loading"
                            :data="state.collectorOptions"
                            style-type="white"
        />
        <collector-options-form v-else
                                has-metadata
                                reset-on-collector-id-change
                                @update:isValid="handleUpdateIsOptionsValid"
        />
        <div class="button-group">
            <p-button v-if="state.isEditMode"
                      style-type="tertiary"
                      size="lg"
                      :disabled="state.isUpdating"
                      @click="handleClickCancel"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
            </p-button>
            <p-button v-if="state.isEditMode"
                      style-type="primary"
                      size="lg"
                      :loading="state.isUpdating"
                      class="save-changes-button"
                      @click="handleClickSave"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PButton, PPaneLayout, PDefinitionTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel, CollectorOptions, CollectorUpdatePluginParameter } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import CollectorOptionsForm from '@/services/asset-inventory/collector/shared/collector-forms/CollectorOptionsForm.vue';



const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    loading: computed<boolean>(() => !collectorFormState.originCollector),
    collectorOptions: computed<CollectorOptions>(() => collectorFormState.originCollector?.plugin_info?.options ?? {}),
    collectorOptionsSchema: computed<JsonSchema>(() => collectorFormState.originCollector?.plugin_info?.metadata?.options_schema ?? {
        type: 'object',
        properties: {},
    }),
    fields: computed<DefinitionField[]>(() => {
        const properties = state.collectorOptionsSchema?.properties ?? {};
        return Object.entries<JsonSchema['properties']>(properties).map(([key, property]) => ({
            name: key,
            label: property.title ?? key,
        }));
    }),
    isEditMode: false,
    isOptionsValid: false,
    isUpdating: false,
});

const fetchCollectorPluginUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const params: CollectorUpdatePluginParameter = {
        collector_id: collectorFormStore.collectorId,
        options: collectorFormState.options,
    };
    return SpaceConnector.client.inventory.collector.updatePlugin(params);
};
const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleUpdateIsOptionsValid = (value: boolean) => {
    state.isOptionsValid = value;
};

const handleClickCancel = () => {
    state.isEditMode = false;
};

const handleClickSave = async () => {
    try {
        state.isUpdating = true;
        const collector = await fetchCollectorPluginUpdate();
        collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_COLLECTOR_OPTIONS'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetOptions();
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_COLLECTOR_OPTIONS'));
    } finally {
        state.isUpdating = false;
    }
};

</script>

<style lang="postcss" scoped>
.p-definition-table {
    border-color: transparent;
}
.collector-options-form {
    padding: 0 1rem;
}
.button-group {
    padding: 1rem;
    margin-bottom: 1.5rem;
    .save-changes-button {
        margin-left: 1rem;
    }
}
</style>

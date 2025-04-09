<script setup lang="ts">
import {
    computed,
    onMounted, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep, random } from 'lodash';

import {
    PIconButton, PFieldGroup, PTextInput, PButton, PFieldTitle,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { isFieldNameValid } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import type { TransformDataTableProps, TransformDataTableInfo } from '@/common/modules/widgets/types/widget-data-table-type';
import type { AddLabelsOptions } from '@/common/modules/widgets/types/widget-model';

interface AdditionalLabel {
    name: string;
    value: string;
}

const DATE_FIELD = 'Date';
const COMPONENT_RANDOM_KEY = `add-labels-${random()}`;
const props = defineProps<TransformDataTableProps<AddLabelsOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: AddLabelsOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

/* Query */
const currentDataTable = useWidgetDataTableQuery(computed(() => props.originData?.data_table_id));


const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const labelsInfo = ref<AddLabelsOptions['labels']>(cloneDeep(props.originData.labels));
const state = reactive({
    proxyOperatorOptions: useProxyValue<AddLabelsOptions>('operator-options', props, emit),
    refinedLabels: [] as AdditionalLabel[],
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions?.data_table_id) return true;
        if (!state.refinedLabels.length) return true;
        if (state.refinedLabels.some((label) => !label.name || !label.value)) return true;
        const fieldNames = state.refinedLabels.map((label) => label.name);
        if (fieldNames.includes(DATE_FIELD)) return true;
        if (fieldNames.length !== new Set(fieldNames).size) return true;
        if (state.refinedLabels.some((d) => !isFieldNameValid(d.name, currentDataTable.data.value))) return true;
        return false;
    }),
});

/* Helper */
const getInvalidText = (idx: number): TranslateResult|undefined => {
    const targetName = state.refinedLabels[idx]?.name;
    if (!targetName) {
        return undefined;
    }
    if (targetName === DATE_FIELD) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.DATE_FIELD_INVALID');
    }
    if (state.refinedLabels.some((label, lIdx) => lIdx !== idx && label.name === targetName)) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.DUPLICATED_LABEL');
    }
    if (!isFieldNameValid(targetName, currentDataTable.data.value)) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DUPLICATED_FIELD_NAME');
    }
    return undefined;
};

/* Events */
const handleClickAddLabel = () => {
    state.refinedLabels = [
        ...state.refinedLabels,
        {
            name: '',
            value: '',
        },
    ];
};
const handleRemoveLabel = (idx: number) => {
    state.refinedLabels = state.refinedLabels.filter((_, index) => index !== idx);
};

/* Watcher */
watch([dataTableInfo, () => state.refinedLabels], ([_dataTableInfo, _refinedLabels]) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        labels: _refinedLabels.reduce((acc, label) => {
            if (label.name && label.value) {
                acc[label.name] = label.value;
            }
            return acc;
        }, {}),
    };
}, { deep: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });

onMounted(() => {
    state.refinedLabels = Object.entries(labelsInfo.value).map(([name, value]) => ({ name, value }));
});
</script>

<template>
    <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                        :operator="DATA_TABLE_OPERATOR.ADD_LABELS"
                                                        :data-table-info.sync="dataTableInfo"
                                                        class="widget-form-data-table-card-transform-add-labels"
    >
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ADDITIONAL_LABELS')"
                       required
        >
            <div class="additional-labels-wrapper">
                <div v-if="state.refinedLabels.length"
                     class="field-title-wrapper"
                >
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.NAME')"
                                   size="sm"
                                   color="gray"
                                   inline
                    />
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.VALUE')"
                                   size="sm"
                                   color="gray"
                                   inline
                    />
                </div>
                <div v-for="(labelInfo, idx) in state.refinedLabels"
                     :key="`${COMPONENT_RANDOM_KEY}-${idx}`"
                     class="label-wrapper"
                >
                    <div class="label-set">
                        <p-text-input class="label-input"
                                      block
                                      :invalid="!!getInvalidText(idx)"
                                      :value.sync="labelInfo.name"
                        />
                        <p-text-input class="label-input"
                                      block
                                      :value.sync="labelInfo.value"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       :disabled="state.refinedLabels.length === 1"
                                       @click="handleRemoveLabel(idx)"
                        />
                    </div>
                    <p v-if="getInvalidText(idx)"
                       class="invalid-text"
                    >
                        {{ getInvalidText(idx) }}
                    </p>
                </div>
                <p-button class="add-field-button"
                          style-type="tertiary"
                          icon-left="ic_plus_bold"
                          @click="handleClickAddLabel"
                >
                    {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.ADD_LABEL') }}
                </p-button>
            </div>
        </p-field-group>
    </widget-form-data-table-card-transform-form-wrapper>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-transform-add-labels {
    @apply flex flex-col gap-2;

    .additional-labels-wrapper {
        @apply bg-gray-100 rounded;
        padding: 0.5rem;
        margin-top: 0.5rem;
    }
    .field-title-wrapper {
        margin-bottom: 0.25rem;
        .field-title {
            width: calc(50% - 0.875rem);
        }
    }
    .label-wrapper {
        margin-bottom: 0.5rem;
        .label-set {
            @apply flex gap-1 items-center;
        }
        .invalid-text {
            @apply text-label-sm text-red-500;
            margin-top: 0.25rem;
        }
    }
    .add-field-button {
        margin-top: 0.5rem;
        width: 6.8125rem;
    }
}
</style>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { random } from 'lodash';

import {
    PIconButton, PFieldGroup, PTextInput, PButton, PFieldTitle,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { AdditionalLabel } from '@/common/modules/widgets/types/widget-data-table-type';



const DATE_FIELD = 'Date';
const COMPONENT_RANDOM_KEY = `add-labels-${random()}`;
interface Props {
    labels: (AdditionalLabel[]|string[]);
}

const props = defineProps<Props>();

const emit = defineEmits<{ e: 'update:labels'; value: AdditionalLabel[]}>();
const state = reactive({
    proxyLabels: useProxyValue<AdditionalLabel[]>('labels', props, emit),
    groupByKeys: computed<string[]>(() => []),
});

/* Helper */
const getInvalidText = (idx: number): TranslateResult|undefined => {
    const targetName = state.proxyLabels[idx]?.name;
    if (!targetName) {
        return undefined;
    }
    if (state.groupByKeys.includes(targetName)) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.GROUP_BY_KEY_INVALID');
    }
    if (targetName === DATE_FIELD) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.DATE_FIELD_INVALID');
    }
    if (state.proxyLabels.some((label, lIdx) => lIdx !== idx && label.name === targetName)) {
        return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_LABELS.DUPLICATED_LABEL');
    }
    return undefined;
};

/* Events */
const handleClickAddLabel = () => {
    state.proxyLabels = [
        ...state.proxyLabels,
        {
            name: '',
            value: '',
        },
    ];
};
const handleRemoveLabel = (idx: number) => {
    state.proxyLabels = state.proxyLabels.filter((_, index) => index !== idx);
};
</script>

<template>
    <div class="widget-form-data-table-card-transform-form-add-labels">
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ADDITIONAL_LABELS')"
                       required
        >
            <div class="additional-labels-wrapper">
                <div v-if="state.proxyLabels.length"
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
                <div v-for="(labelInfo, idx) in state.proxyLabels"
                     :key="`${COMPONENT_RANDOM_KEY}-${idx}`"
                     class="label-wrapper"
                >
                    <div class="label-set">
                        <p-text-input class="label-input"
                                      block
                                      :value.sync="labelInfo.name"
                        />
                        <p-text-input class="label-input"
                                      block
                                      :value.sync="labelInfo.value"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       :disabled="state.proxyLabels.length === 1"
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
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-transform-form-add-labels {
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

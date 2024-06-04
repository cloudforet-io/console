<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PFieldGroup, PTextInput, PToggleButton, PSelectDropdown, PButton, PIconButton,
} from '@spaceone/design-system';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import type { BasisFieldOptions, WidgetFieldSchema } from '@/common/modules/widgets/types/widget-config-type';

import { gray } from '@/styles/colors';


interface FormatRule {
    threshold: number;
    color: string;
}
interface Props {
    widgetFieldSchema: WidgetFieldSchema<BasisFieldOptions>;
    required: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    widgetFieldSchema: () => ({
        label: '',
    }),
});

const state = reactive({
    enabled: false,
    formatRules: [] as FormatRule[],
});

/* Event */
const handleChangeToggleButton = (val: boolean) => {
    state.enabled = val;
};
const handleClickAddFormatRule = () => {
    state.formatRules.push({ threshold: 0, color: gray[200] });
};
const handleDeleteFormatRule = (idx: number) => {
    state.formatRules.splice(idx, 1);
    state.formatRules = [...state.formatRules];
};
</script>

<template>
    <div class="widget-field-progress-bar">
        <p-field-group :label="props.widgetFieldSchema.label"
                       required
        >
            <template #label-extra>
                <p-toggle-button :value="state.enabled"
                                 class="toggle-button"
                                 @change-toggle="handleChangeToggleButton"
                />
            </template>
            <div class="form-content-wrapper"
                 :class="{ 'display': state.enabled }"
            >
                <div class="description">
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.PROGRESS_BAR_DESCRIPTION_1') }}</span>
                    <code class="formula-text">{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.PROGRESS_BAR_DESCRIPTION_2') }}</code>
                </div>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FIELD_NAME')"
                               style-type="secondary"
                               required
                >
                    <p-text-input :value="''" />
                </p-field-group>
                <div class="field-wrapper">
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.BASIS_FIELD')"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="[]" />
                    </p-field-group>
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL_FIELD')"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="[]" />
                    </p-field-group>
                </div>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
                               style-type="secondary"
                               required
                >
                    <p-button icon-left="ic_plus_bold"
                              style-type="tertiary"
                              class="add-button"
                              @click="handleClickAddFormatRule"
                    >
                        {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                    </p-button>
                    <div v-for="(formatRule, idx) in state.formatRules"
                         :key="`format-rule-${formatRule.threshold}-${formatRule.color}-${idx}`"
                         class="format-rules-form-wrapper"
                    >
                        <p-text-input :value="formatRule.threshold"
                                      type="number"
                                      placeholder="Threshold"
                        />
                        <color-input :value="formatRule.color"
                                     @update:value="formatRule.color = $event"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="negative-transparent"
                                       size="sm"
                                       :disabled="state.formatRules.length === 1"
                                       class="delete-button"
                                       @click="handleDeleteFormatRule(idx)"
                        />
                    </div>
                </p-field-group>
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    .p-field-title {
        .title-wrapper .title {
            display: flex;
            align-items: center;
        }
        .toggle-button {
            margin-left: 0.25rem;
        }
    }
}
.form-content-wrapper {
    display: none;
    &.display {
        display: block;
    }
    .description {
        @apply text-paragraph-sm;
        padding-bottom: 0.5rem;
        .formula-text {
            @apply bg-gray-100 text-gray-700;
            padding-left: 0.25rem;
        }
    }
    .add-button {
        margin-bottom: 0.5rem;
    }
    .field-wrapper {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        .p-field-group {
            width: 50%;
        }
    }
    .format-rules-form-wrapper {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        padding-bottom: 0.5rem;
        .p-text-input {
            flex: 1;
            width: 100%;
        }
        .delete-button {
            width: 2rem;
        }
    }
}
</style>

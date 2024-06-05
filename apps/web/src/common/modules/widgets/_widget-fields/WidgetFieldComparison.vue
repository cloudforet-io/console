<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldTitle, PToggleButton, PFieldGroup, PSelectDropdown, PButton, PTextInput, PDivider,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import { i18n } from '@/translations';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import type {
    ComparisonOptions,
} from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';

import { green, red } from '@/styles/colors';


interface ComparisonValue {
    fieldName?: string;
    compareWith?: string;
    compareTarget?: string;
    decreaseColor?: string;
    increaseColor?: string;
    format?: 'all'|'percent'|'fixed';
}

const emit = defineEmits<{(e: 'update:value', value: ComparisonValue[]): void;
}>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<ComparisonOptions>>(), {
    widgetFieldSchema: () => ({
        label: '',
        options: {
            toggle: false,
            granularity: GRANULARITY.DAILY,
            forTable: false,
            compareTargets: [],
        },
    }),
});

const state = reactive({
    toggleValue: props.widgetFieldSchema.options?.toggle ?? false,
    value: [] as ComparisonValue[],
    compareWith: computed(() => {
        const granularity = props.widgetFieldSchema.options?.granularity ?? GRANULARITY.DAILY;
        if (granularity === GRANULARITY.MONTHLY) return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_MONTH');
        if (granularity === GRANULARITY.YEARLY) return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_YEAR');
        return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_DAY');
    }),
    isForTable: computed(() => props.widgetFieldSchema.options?.forTable ?? false),
    initialValue: computed(() => ({
        fieldName: '',
        compareWith: state.compareWith,
        compareTarget: '',
        decreaseColor: green[600],
        increaseColor: red[500],
        format: 'all',
    })),
    formatMenu: [
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.ALL'), name: 'all' },
        { label: `${i18n.t('COMMON.WIDGETS.COMPARISON.PERCENT')}(%)`, name: 'percent' },
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.FIXED'), name: 'fixed' },
    ],
});

const handleAddComparison = () => {
    state.value.push(cloneDeep(state.initialValue));
    emit('update:value', state.value);
};

// { key, index }:{key: 'decreaseColor'|'increaseColor'; index: number}
const handleUpdateColor = (key:string, index:number, color:string) => {
    state.value[index] = {
        ...state.value[index],
        [key]: color,
    };
    emit('update:value', state.value);
};
const handleUpdateToggle = (value: boolean) => {
    state.toggleValue = value;
    if (value) emit('update:value', state.value);
    else {
        state.value = [];
        emit('update:value', []);
    }
};

const handleUpdateFormat = (format: string, index: number) => {
    state.value[index] = {
        ...state.value[index],
        format,
    };
    emit('update:value', state.value);
};

onMounted(() => {
    state.value = [state.initialValue];
});

</script>

<template>
    <div class="widget-field-total">
        <div class="header">
            <p-field-title>{{ $t('COMMON.WIDGETS.COMPARISON.COMPARISON') }}</p-field-title>
            <p-toggle-button :value="state.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.toggleValue"
             class="contents-box"
             :class="{'for-table': state.isForTable}"
        >
            <div v-for="(item, index) in state.value"
                 :key="index"
                 class="form-container"
            >
                <div class="mb-2">
                    <p-divider v-if="index !== 0" />
                </div>
                <p-field-group v-if="state.isForTable"
                               :label="$t('COMMON.WIDGETS.COMPARISON.FIELD_NAME')"
                               style-type="secondary"
                               required
                >
                    <p-text-input :value="state.value[index].fieldName"
                                  class="w-full"
                                  @update:value="(value) => state.value[index].fieldName = value"
                    />
                </p-field-group>
                <div class="row-1">
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.COMPARE_WITH')"
                                   class="left"
                                   style-type="secondary"
                                   required
                    >
                        <span class="compare-with">{{ state.compareWith }}</span>
                    </p-field-group>
                    <p-field-group v-if="state.isForTable"
                                   :label="$t('COMMON.WIDGETS.COMPARISON.COMPARE_TARGET')"
                                   style-type="secondary"
                                   class="w-full"
                                   required
                    >
                        <p-select-dropdown class="w-full"
                                           :menu="[1,2]"
                        />
                    </p-field-group>
                </div>
                <div class="row-2">
                    <div class="left">
                        <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.DECREASE')"
                                       style-type="secondary"
                                       required
                        >
                            <color-input :value="state.value[index].decreaseColor"
                                         @update:value="(color) => handleUpdateColor('decreaseColor', index, color)"
                            />
                        </p-field-group>
                        <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.INCREASE')"
                                       style-type="secondary"
                                       required
                        >
                            <color-input :value="state.value[index].increaseColor"
                                         @update:value="(color) => handleUpdateColor('increaseColor', index, color)"
                            />
                        </p-field-group>
                    </div>
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.FORMAT')"
                                   class="w-full"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="state.formatMenu"
                                           class="w-full"
                                           :selected="state.value[index].format"
                                           @update:selected="(format) => handleUpdateFormat(format, index)"
                        />
                    </p-field-group>
                </div>
            </div>
            <p-button v-if="state.isForTable"
                      style-type="tertiary"
                      icon-left="ic_plus_bold"
                      @click="handleAddComparison"
            >
                {{ $t('COMMON.WIDGETS.COMPARISON.ADD_COMPARISON') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .header {
        @apply flex items-center gap-1;
        margin-bottom: 0.5rem;
    }

    .contents-box {
        &.for-table {
            @apply p-2 bg-gray-100 rounded;
        }

        .row-1 {
            @apply flex gap-2;

            .left {
                flex-shrink: 0;
                width: 10rem;
            }

            .compare-with {
                @apply text-label-md text-gray-800;
            }
        }

        .row-2 {
            @apply flex gap-2;
            .left {
                @apply flex gap-3;
                flex-shrink: 0;
                width: 10rem;
            }
        }
    }
}
</style>

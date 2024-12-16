<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup,
} from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';
import { COLOR_SCHEMA } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { ColorSchemaValue, ColorSchemaOptions } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';

const DEFAULT_COLOR = 'Coral';
const emit = defineEmits<WidgetFieldComponentEmit<ColorSchemaValue>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<ColorSchemaOptions, ColorSchemaValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: 'ic_circle-filled',
        },
    }),
});
type ColorSchemaMenuItem = {
    name: ColorSchemaValue['colorName'],
    label: ColorSchemaValue['colorName']
};
const state = reactive({
    proxyValue: useProxyValue<ColorSchemaValue|undefined>('value', props, emit),
    visibleMenu: false,
    selectedColor: DEFAULT_COLOR,
    colorSchemaList: computed<ColorSchemaMenuItem[]>(() => (Object.keys(COLOR_SCHEMA) as ColorSchemaValue['colorName'][]).map((key) => ({
        name: key,
        label: key,
    }))),
    isValid: computed<boolean>(() => !!state.proxyValue?.colorValue?.length && !!state.proxyValue?.colorName),
});

const handleClickColor = (color: ColorSchemaMenuItem) => {
    state.selectedColor = color.name;
    state.visibleMenu = false;
    state.proxyValue = {
        colorName: color.name,
        colorValue: COLOR_SCHEMA[color.name],
    };
};

watch(() => state.proxyValue, () => {
}, { immediate: true });
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

const initValue = () => {
    if (props.value !== undefined) {
        state.proxyValue = props.value;
    } else {
        state.proxyValue = {
            colorName: DEFAULT_COLOR,
            colorValue: COLOR_SCHEMA.Coral,
        };
    }
    state.selectedColor = state.colorSchemaList.find((color) => color.name === state.proxyValue?.colorName)?.name ?? DEFAULT_COLOR;
};

onMounted(() => {
    initValue();
});

const gradientGenerator = (color: string) => `linear-gradient(90deg, ${COLOR_SCHEMA[color].join(', ')})`;

</script>

<template>
    <div class="widget-field-color">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.COLOR_SCHEMA')"
                       required
        >
            <div class="contents">
                <p-select-dropdown :visible-menu.sync="state.visibleMenu"
                                   use-fixed-menu-style
                                   :menu="state.colorSchemaList"
                                   :selected="state.selectedColor"
                                   block
                >
                    <template #dropdown-button>
                        <span class="color-circle"
                              :class="state.selectedColor"
                        />
                        <span>{{ state.selectedColor }}</span>
                    </template>
                    <template #menu-menu>
                        <div class="menu-container">
                            <div v-for="colorSchema in state.colorSchemaList"
                                 :key="colorSchema.name"
                                 class="color-card"
                                 :class="colorSchema.name === state.selectedColor ? 'selected' : ''"
                                 @click="handleClickColor(colorSchema)"
                            >
                                <div class="color-label">
                                    {{ colorSchema.label }}
                                </div>
                                <div class="color-bar"
                                     :style="{ background: gradientGenerator(colorSchema.name) }"
                                />
                            </div>
                        </div>
                    </template>
                </p-select-dropdown>
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-color {
    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;

        .menu-container {
            .color-card {
                @apply flex flex-col justify-center gap-1;
                width: 100%;
                height: 3.4375rem;

                .color-label {
                    @apply text-sm truncate text-label-sm;
                    margin-left: 0.5rem;
                }
                .color-bar {
                    height: 0.75rem;
                    width: calc(100% - 1rem);
                    margin: 0 0.5rem;
                    border-radius: 999px;
                }

                &:hover {
                    @apply bg-blue-100;
                }

                &.selected {
                    @apply bg-blue-200;
                }
            }
        }
    }
    .color-circle {
        @apply rounded-full;
        width: 1rem;
        height: 1rem;
        &.Coral {
            background: linear-gradient(90deg, #ffd4c8 0%, #ca4f28 100%);
        }
        &.Yellow {
            background: linear-gradient(90deg, #f8f6ed 0%, #d9ae00 100%);
        }
        &.Green {
            background: linear-gradient(90deg, #e8f9b8 0%, #60b731 100%);
        }
        &.Violet {
            background: linear-gradient(90deg, #e1e0fa 0%, #6638b6 100%);
        }
        &.Blue {
            background: linear-gradient(90deg, #e0f2ff 0%, #007ee5 100%);
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>

<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PFieldTitle, PSelectDropdown, PToggleButton, PI, PTooltip,
} from '@cloudforet/mirinae';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import {
    widgetFieldDefaultValueMap,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import {
    widgetValidatorRegistry,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { Icon, IconOptions, _IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const FIELD_KEY = 'icon';

const props = defineProps<_WidgetFieldComponentProps<IconOptions>>();
const validator = widgetValidatorRegistry[FIELD_KEY];

const state = reactive({
    fieldValue: computed<_IconValue>(() => props.fieldManager.data[FIELD_KEY].value),
    visibleMenu: false,
    invalid: computed(() => !validator(state.fieldValue, props.widgetConfig)),
    iconList: ICON_FIELD_ITEMS,
    defaultColor: widgetFieldDefaultValueMap.icon.color,
});

const handleUpdateValue = (value: boolean) => {
    if (!value) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            ...widgetFieldDefaultValueMap.icon,
        });
    }
};

const handleClickIcon = (icon: Icon) => {
    state.visibleMenu = false;
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        icon,
    });
};

const handleUpdateColor = (color: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        color,
    });
};

</script>

<template>
    <div class="widget-field-icon">
        <div class="field-header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ICON') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateValue"
            />
        </div>
        <div v-if="state.fieldValue?.toggleValue"
             class="contents"
        >
            <p-select-dropdown :visible-menu.sync="state.visibleMenu"
                               use-fixed-menu-style
                               :menu="state.iconList"
                               block
            >
                <template #dropdown-button>
                    <div class="button-label">
                        <p-i :name="state.fieldValue?.icon?.name"
                             :color="state.fieldValue?.color ?? state.defaultColor"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ state.fieldValue?.icon?.label ?? 'Select' }}</span>
                    </div>
                </template>
                <template #menu-menu>
                    <div class="menu-container">
                        <div v-for="icon in state.iconList"
                             :key="icon.name"
                             class="icon-card"
                             :class="icon.name === state.fieldValue?.icon?.name ? 'selected' : ''"
                             @click="handleClickIcon(icon)"
                        >
                            <div class="icon-box">
                                <p-i :name="icon.name"
                                     :color="state.fieldValue?.color ?? state.defaultColor"
                                     width="1.5rem"
                                     height="1.5rem"
                                />
                            </div>
                            <p-tooltip :contents="icon.label"
                                       position="bottom"
                            >
                                <div class="icon-label">
                                    {{ icon.label }}
                                </div>
                            </p-tooltip>
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
            <color-input :value="state.fieldValue?.color ?? state.defaultColor"
                         @update:value="handleUpdateColor"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-icon {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;
        .button-label {
            @apply flex items-center;
            gap: 0.125rem;
        }

        .menu-container {
            @apply grid grid-cols-4 gap-2 p-4;
            max-height: 30rem;
            overflow-y: auto;

            .icon-card {
                @apply rounded-lg;
                width: 100%;
                height: 4.4375rem;

                .icon-box {
                    @apply flex items-center justify-center;
                    padding: 1rem 0 0.5rem 0;
                }

                .icon-label {
                    @apply text-sm text-center truncate text-label-sm;
                    padding: 0 0.375rem;
                }

                &:hover {
                    @apply bg-blue-100;
                }

                &.selected {
                    @apply border border-blue-600;
                }
            }
        }
    }
}
</style>

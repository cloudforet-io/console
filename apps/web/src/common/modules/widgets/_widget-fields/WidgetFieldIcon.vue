<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';

import {
    PFieldTitle, PSelectDropdown, PToggleButton, PI, PTooltip,
} from '@spaceone/design-system';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    IconOptions,
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';
import type { Icon, IconValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


const emit = defineEmits<WidgetFieldComponentEmit<IconValue>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<IconOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: 'ic_circle-filled',
        },
    }),
});

const DEFAULT_ICON:Icon = { name: 'ic_circle-filled', label: 'Circle' };
const DEFAULT_COLOR:string = gray[900];

const state = reactive({
    proxyValue: useProxyValue<IconValue|undefined>('value', props, emit),
    isEnable: !!props.value,
    visibleMenu: false,
    selectedIcon: DEFAULT_ICON as Icon,
    iconList: [
        { name: 'ic_circle-filled', label: 'Circle' },
        { name: 'ic_coin-filled', label: 'Coin' },
        { name: 'ic_lock-filled', label: 'Lock' },
        { name: 'ic_spanner-filled', label: 'Spanner' },
        { name: 'ic_home-filled', label: 'Home' },
        { name: 'ic_rocket-filled', label: 'Rocket' },
        { name: 'ic_error-filled', label: 'Error' },
        { name: 'ic_limit-filled', label: 'Limit' },
        { name: 'ic_megaphone-filled', label: 'Megaphone' },
        { name: 'ic_warning-filled', label: 'Warning' },
        { name: 'ic_sparkle-filled', label: 'Sparkle' },
        { name: 'ic_arrow-right-up-with-sparkles', label: 'Arrow Right-up with sparkles' },
        { name: 'ic_service_metric-explorer', label: 'Gauge' },
        { name: 'ic_service_cloud-service', label: 'Cloud' },
        { name: 'ic_service_project', label: 'Planet' },
        { name: 'ic_service_budget', label: 'Budget' },
        { name: 'ic_service_cost-report', label: 'Budget Report' },
        { name: 'ic_service_server', label: 'Server' },
        { name: 'ic_private-repository', label: 'Private Repository' },
        { name: 'ic_service_data-sources', label: 'Data Source' },
        { name: 'ic_service_alert-dashboard', label: 'Monitor' },
        { name: 'ic_service_alert', label: 'Notice' },
        { name: 'ic_service_user', label: 'User' },
        { name: 'ic_service_escalation-policy', label: 'Escalation' },
        { name: 'ic_service_workspaces', label: 'Cube' },
        { name: 'ic_service_domain-settings', label: 'Settings' },
        { name: 'ic_service_security', label: 'Security Lock' },
        { name: 'ic_my-page_account-and-profile', label: 'Authorization' },
        { name: 'ic_service_service-account', label: 'Security key' },
    ] as Icon[],
});

const handleUpdateValue = (value: boolean) => {
    state.isEnable = value;
    if (!value) {
        state.proxyValue = undefined;
    } else {
        initValue();
    }
};

const handleClickIcon = (icon: Icon) => {
    state.selectedIcon = icon;
    state.visibleMenu = false;
    if (!state.proxyValue) {
        state.proxyValue = {
            icon,
            color: DEFAULT_COLOR,
        };
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            icon,
        };
    }
};

const handleUpdateColor = (color: string) => {
    if (!state.proxyValue?.icon) {
        state.proxyValue = {
            icon: DEFAULT_ICON,
            color,
        };
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            color,
        };
    }
    emit('update:value', state.proxyValue);
};

const checkValue = ():boolean => {
    if (state.isEnable) {
        return !!(state.proxyValue?.color && state.iconList.find((icon) => icon.name === state.proxyValue?.icon?.name));
    }
    return true;
};

watch(() => state.proxyValue, () => {
    emit('update:is-valid', checkValue());
}, { immediate: true });

const initValue = () => {
    if (props.value !== undefined) {
        state.proxyValue = props.value;
    } else {
        state.proxyValue = {
            icon: state.iconList.find((icon) => icon.name === props.widgetFieldSchema?.options?.default) ?? DEFAULT_ICON,
            color: gray[900],
        };
    }
    state.selectedIcon = state.iconList.find((icon) => icon.name === state.proxyValue?.icon?.name) ?? DEFAULT_ICON;
};

onMounted(() => {
    if (!state.isEnable) state.proxyValue = undefined;
    else {
        initValue();
    }
});

</script>

<template>
    <div class="widget-field-icon">
        <div class="header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ICON') }}</p-field-title>
            <p-toggle-button :value="state.isEnable"
                             @update:value="handleUpdateValue"
            />
        </div>
        <div v-if="state.isEnable"
             class="contents"
        >
            <p-select-dropdown class="w-full"
                               :visible-menu.sync="state.visibleMenu"
                               use-fixed-menu-style
                               :menu="state.iconList"
            >
                <template #dropdown-button>
                    <div class="button-label">
                        <p-i :name="state.selectedIcon?.name"
                             :color="state.proxyValue?.color ?? DEFAULT_COLOR"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ state.selectedIcon.label ?? 'Select' }}</span>
                    </div>
                </template>
                <template #menu-menu>
                    <div class="menu-container">
                        <div v-for="icon in state.iconList"
                             :key="icon.name"
                             class="icon-card"
                             :class="icon.name === state.selectedIcon?.name ? 'selected' : ''"
                             @click="handleClickIcon(icon)"
                        >
                            <div class="icon-box">
                                <p-i :name="icon.name"
                                     :color="state.proxyValue?.color ?? DEFAULT_COLOR"
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
            <color-input :value="state.proxyValue?.color ?? DEFAULT_COLOR"
                         @update:value="handleUpdateColor"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-icon {
    margin-bottom: 1rem;
    .header {
        @apply flex items-center gap-1;
        margin-bottom: 0.5rem;
    }

    .contents {
        @apply flex gap-2;
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

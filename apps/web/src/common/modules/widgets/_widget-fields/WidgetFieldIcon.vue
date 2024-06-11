<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
    PFieldTitle, PSelectDropdown, PToggleButton, PI, PTooltip,
} from '@spaceone/design-system';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import type { IconOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';

import { gray } from '@/styles/colors';


const emit = defineEmits<WidgetFieldComponentEmit<{ icon: Icon, color: string }>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<IconOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: false,
        },
    }),
});

interface Icon {
  name: string;
  label: string;
}

const state = reactive({
    value: props.widgetFieldSchema.options?.default ?? false,
    visibleMenu: false,
    color: gray[900],
    selectedIcon: { name: 'ic_circle-filled', label: 'Circle' } as Icon,
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
        { name: 'ic_service_metric-explorer', label: 'Guage' },
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
        { name: 'ic_service_service-account', label: 'Security' },
        { name: 'ic_my-page_account-and-profile', label: 'Authorization' },
        { name: 'ic_service_service-account', label: 'Security key' },
    ] as Icon[],
});

const handleUpdateValue = (value: boolean) => {
    state.value = value;
};

const handleClickIcon = (icon: Icon) => {
    state.selectedIcon = icon;
    state.visibleMenu = false;
};

const handleUpdateColor = (color: string) => {
    state.color = color;
};

const checkValue = ():boolean => {
    if (state.color && state.iconList.find((icon) => icon.name === state.selectedIcon?.name)) {
        return true;
    }
    return false;
};

watch([() => state.selectedIcon, () => state.color], ([icon, color]) => {
    emit('update:value', {
        icon,
        color,
    });
    const isValid = checkValue();
    emit('update:is-valid', isValid);
});

</script>

<template>
    <div class="widget-field-icon">
        <div class="header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ICON') }}</p-field-title>
            <p-toggle-button :value="state.value"
                             @update:value="handleUpdateValue"
            />
        </div>
        <div v-if="state.value"
             class="contents"
        >
            <p-select-dropdown class="w-full"
                               :visible-menu.sync="state.visibleMenu"
                               :menu="state.iconList"
            >
                <template #dropdown-button>
                    <div class="button-label">
                        <p-i :name="state.selectedIcon?.name"
                             :color="state.color"
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
                                     :color="state.color"
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
            <color-input :value="state.color"
                         @update:value="handleUpdateColor"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-icon {
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

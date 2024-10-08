<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PI, PTextarea, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type { WidgetFieldComponentEmit, WidgetFieldComponentProps } from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<WidgetHeaderValue|undefined>>();
const props = defineProps<WidgetFieldComponentProps<undefined, WidgetHeaderValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    isHeaderCollapsed: false,
    isWidgetTitleValid: computed<boolean>(() => {
        if (!state.proxyValue?.toggleValue) return true;
        return !!state.proxyValue?.title?.trim();
    }),
    titleInvalidText: computed(() => {
        if (!state.proxyValue?.title?.trim()?.length) {
            return i18n.t('COMMON.WIDGETS.WIDGET_TITLE_REQUIRED');
        }
        return undefined;
    }),
});

/* Event */
const handleClickCollapsibleTitle = () => {
    if (!state.proxyValue?.toggleValue) return;
    state.isHeaderCollapsed = !state.isHeaderCollapsed;
};
const handleToggleWidgetHeader = () => {
    const _toggleValue = !state.proxyValue?.toggleValue;
    emit('update:value', {
        toggleValue: _toggleValue,
        title: _toggleValue ? props.widgetConfig?.meta?.title : undefined,
        description: undefined,
    });
    state.isHeaderCollapsed = !_toggleValue;
};
const handleUpdateValue = (key: string, value: string) => {
    state.proxyValue = {
        ...state.proxyValue,
        [key]: value.trim(),
    };
    emit('update:value', state.proxyValue);
};

/* Watcher */
watch(() => state.isWidgetTitleValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });

onMounted(() => {
    emit('update:is-valid', true);
    if (!state.proxyValue) {
        state.proxyValue = {
            toggleValue: true,
            title: props.widgetConfig?.meta?.title,
        };
    }
});
</script>
<template>
    <div class="form-group-wrapper"
         :class="{ 'collapsed': state.isHeaderCollapsed }"
    >
        <div class="title-wrapper flex justify-between align-middle"
             :class="{ 'disabled': !props.value?.toggleValue }"
             @click="handleClickCollapsibleTitle"
        >
            <div class="left-part">
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.WIDGET_HEADER') }}</span>
            </div>
            <div class="right-part flex">
                <p-toggle-button :value="state.proxyValue?.toggleValue"
                                 @update:value="handleToggleWidgetHeader"
                />
            </div>
        </div>
        <div class="form-wrapper widget-header-field">
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                           :invalid-text="state.titleInvalidText"
                           :invalid="!state.isWidgetTitleValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="state.proxyValue?.title"
                                  :invalid="invalid"
                                  @update:value="handleUpdateValue('title', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                <p-textarea :value="state.proxyValue?.description"
                            @update:value="handleUpdateValue('description', $event)"
                />
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-group-wrapper {
    @apply border-t border-gray-200;
    &.collapsed {
        .form-wrapper {
            display: none;
        }
        .arrow-button {
            transform: rotate(-90deg);
        }
        .title-wrapper {
            padding: 1rem 0;
        }
    }
    .arrow-button {
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .form-wrapper {
        @apply flex flex-col;
        padding: 1rem 1.25rem 1rem 1.25rem;
    }
    .title-wrapper {
        @apply text-label-lg;
        font-weight: 700;
        padding-top: 1rem;
        vertical-align: middle;
        cursor: pointer;
        .right-part {
            padding-right: 1.5rem;
        }
        &.disabled {
            cursor: default;
            .arrow-button {
                @apply text-gray-700;
                opacity: 0.5;
            }
        }
    }
}
</style>

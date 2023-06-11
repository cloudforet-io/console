<template>
    <span class="p-copy-button"
          :class="size"
    >
        <span v-if="slots.default"
              ref="textRef"
              class="copy-text"
        >
            <slot name="default" />
        </span>
        <p-i v-if="state.showIcon"
             ref="iconRef"
             class="copy-icon"
             :class="{active: state.click}"
             width="1em"
             height="1em"
             :name="state.click ? 'ic_copy-filled' : 'ic_copy'"
             color="inherit"
             v-on="listeners"
             @mousedown="state.click = true"
             @mouseup="copyText()"
        />
        <transition name="fade">
            <div v-if="state.isAlertVisible"
                 ref="alertRef"
                 class="copy-button-alert"
                 :style="state.alertStyle"
            >
                <p-i name="ic_check"
                     color="white"
                     width="1rem"
                     height="1rem"
                />
                <span>{{ t('COMPONENT.COPY_BUTTON.COPIED') }}</span>
            </div>
        </transition>
    </span>
</template>

<script setup lang="ts">
import {
    computed, onUnmounted, reactive, toRefs, useAttrs, useSlots, watch,
} from 'vue';
import type Vue from 'vue';
import { useI18n } from 'vue-i18n';

import PI from '@/foundation/icons/PI.vue';
import type { Size } from '@/inputs/buttons/copy-button/type';
import { SIZE } from '@/inputs/buttons/copy-button/type';
import { copyAnyData, isNotEmpty } from '@/utils/helpers';

interface Props {
    value?: string|null;
    size?: Size;
    autoHideIcon?: boolean;
    copyManually?: boolean;
}

const ALERT_PAD = 8;

const props = withDefaults(defineProps<Props>(), {
    value: null,
    size: SIZE.md,
    autoHideIcon: false,
    copyManually: false,
});
const emit = defineEmits(['copy', 'copied']);
const slots = useSlots();
const attrs = useAttrs();
const { t } = useI18n();

const state = reactive({
    click: false,
    isAlertVisible: false,
    iconRef: null as Vue|null,
    alertRef: null as Element|null,
    textRef: null as Element|null,
    alertStyle: computed<Partial<CSSStyleDeclaration>>(() => {
        if (!state.iconRef?.$el || !state.alertRef) return {};

        const iconRect: DOMRect = state.iconRef.$el.getBoundingClientRect();
        const alertHeight = state.alertRef.clientHeight;
        const alertWidth = state.alertRef.clientWidth;

        const left = iconRect.right + ALERT_PAD;
        if (left + alertWidth > window.innerWidth) {
            return {
                right: `${ALERT_PAD}px`,
                top: `${iconRect.top - alertHeight - ALERT_PAD}px`,
            };
        }
        return {
            left: `${left}px`,
            top: `${iconRect.top - ((alertHeight - iconRect.height) / 2)}px`,
        };
    }),
    hasText: false,
    showIcon: computed(() => {
        if (!props.autoHideIcon) return true;
        return state.hasText;
    }),
    textObserver: null as null|MutationObserver,
});

const copyText = () => {
    state.isAlertVisible = true;
    setTimeout(() => { state.isAlertVisible = false; }, 500);

    if (!state.click) return;

    if (props.copyManually) {
        emit('copy');
        state.click = false;
        return;
    }

    if (isNotEmpty(props.value)) {
        copyAnyData(props.value);
        emit('copied');
    } else if (state.textRef?.textContent) {
        copyAnyData(state.textRef.textContent);
        emit('copied');
    }

    state.click = false;
};

const listeners = {
    ...attrs,
};

const { iconRef, textRef, alertRef } = toRefs(state);

watch(() => state.textRef, (ref) => {
    if (!ref) {
        if (state.textObserver) state.textObserver.disconnect();
        return;
    }

    const observer = new MutationObserver(() => {
        state.hasText = ref.textContent?.trim();
    });

    observer.observe(ref, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    state.textObserver = observer;

    state.hasText = !!ref.textContent?.trim();
}, { immediate: true });


onUnmounted(() => {
    if (state.textObserver) state.textObserver.disconnect();
});

</script>

<style lang="postcss">

.p-copy-button {
    @apply text-gray-900;
    display: inline-block;
    vertical-align: middle;

    .copy-text {
        margin-right: 0.25rem;
        cursor: text;
        line-height: 1.25;
    }

    .copy-icon {
        @apply text-gray-500;
        &.active {
            @apply text-secondary;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-secondary;
                cursor: pointer;
            }
        }
    }

    .copy-button-alert {
        @apply inline-flex text-white rounded-xs;
        position: fixed;
        z-index: 9999;
        background-color: rgba(theme('colors.gray.900'), 0.88);
        font-weight: 400;
        font-size: 0.75rem;
        line-height: 1.3;
        width: auto;
        padding: 0.25rem 0.5rem;
        justify-content: center;
        align-items: center;
        &.fade-enter-active, &.fade-leave-active {
            transition: opacity 0.3s;
        }
        &.fade-enter, &.fade-leave-to {
            opacity: 0;
        }
    }

    @define-mixin size $text-size {
        font-size: $text-size;
    }
    &.md {
        @mixin size 0.875rem;
    }
    &.sm {
        @mixin size 0.75rem;
    }
}

</style>

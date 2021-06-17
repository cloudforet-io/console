<template>
    <span class="p-copy-button">
        <span v-if="$scopedSlots.default">
            <slot name="default" />
        </span>
        <span
            class="hover:cursor-pointer"
            :style="{color:copyIconColor}"
            v-on="$listeners"
            @mousedown="click=true"
            @mouseup="copyText()"
        >
            <p-i width="0.875rem" height="0.875rem"
                 :name="icon"
                 color="inherit"
                 class="copy-btn"
            />
        </span>
        <transition name="fade">
            <div v-if="isAlertVisible" class="copy-button-alert" :class="alertPosition">
                <p-i name="ic_state_active" color="white" width="1rem" />
                <span>Copied</span>
            </div>
        </transition>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { copyAnyData, isNotEmpty } from '@/util/helpers';
import color from '@/styles/colors';

interface Props {
    value: string|null;
    alertPosition: 'right';
    iconColor: string|null;
}

export default defineComponent({
    name: 'PCopyButton',
    components: { PI },
    props: {
        value: {
            type: String,
            default: null,
        },
        alertPosition: {
            type: String,
            default: 'right',
        },
        iconColor: {
            type: String,
            default: null,
        },
    },
    setup(props: Props, context) {
        const state = reactive({
            click: false,
            icon: computed(() => (state.click ? 'ic_copied' : 'ic_copy')),
            copyIconColor: computed(() => {
                if (state.click) {
                    return color.blue[500];
                }
                return props.iconColor || color.gray[500];
            }),
            isAlertVisible: false,
        });

        const copyText = () => {
            state.isAlertVisible = true;
            setTimeout(() => { state.isAlertVisible = false; }, 500);
            if (state.click) {
                if (isNotEmpty(props.value)) {
                    copyAnyData(props.value);
                } else {
                    context.emit('copy');
                }
                state.click = false;
            }
        };

        return {
            ...toRefs(state),
            copyText,
        };
    },
});
</script>

<style lang="postcss">

.p-copy-button {
    @apply text-gray-900;
    display: inline-flex;
    position: relative;
    font-size: 0.875rem;
    align-items: center;
    .copy-btn {
        margin-bottom: 0.1rem;
        &:hover {
            @apply text-blue-500;
        }
    }
    .copy-button-alert {
        @apply flex text-white rounded-sm;
        background-color: rgba(theme('colors.gray.900'), 0.88);
        position: absolute;
        font-weight: 400;
        font-size: 0.75rem;
        z-index: 2;
        width: 4.75rem;
        height: 1.5rem;
        justify-content: center;
        align-items: center;
        cursor: default;

        &.right {
            right: -5.25rem;
        }
        &.bottom-end {
            right: 0;
            top: 1.5rem;
        }

        &.fade-enter-active, &.fade-leave-active {
          transition: opacity 0.3s;
        }
        &.fade-enter, &.fade-leave-to {
          opacity: 0;
}
    }
}

</style>

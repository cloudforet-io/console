<template>
    <span class="p-copy-button">
        <span v-if="$scopedSlots.default" :style="{color: color}">
            <slot name="default" />
        </span>
        <span class="hover:cursor-pointer" @mousedown="click=true"
              v-on="$listeners"
              @mouseleave="mouseOut()"
              @mouseenter="onMouseOver()"
              @mouseup="copyText()"
        >
            <p-i :width="width" :height="height" :name="icon"
                 :color="color"
            />
        </span>
        <transition name="fade">
            <div v-if="isAlertVisible" class="copy-button-alert">
                <p-i name="ic_state_active" color="inherit" width="1rem" />
                <span>Copied</span>
            </div>
        </transition>
    </span>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/atoms/icons/PI.vue';
import { copyAnyData, isNotEmpty } from '@/util/helpers';
import { mouseOverState } from '@/util/composition-helpers';
import color from '@/styles/colors';

export default {
    name: 'PCopyButton',
    components: { PI },
    event: ['copy'],
    props: {
        value: {
            type: String,
            default: null,
        },
        width: {
            type: String,
            default: '1rem',
        },
        height: {
            type: String,
            default: '1rem',
        },
    },
    setup(props, context) {
        const { isMouseOver, onMouseOut, onMouseOver } = mouseOverState();

        const state = reactive({
            click: false,
            icon: computed(() => (state.click ? 'ic_copied' : 'ic_copy')),
            color: computed(() => {
                if (state.click || isMouseOver.value) {
                    return color.blue[500];
                }
                return undefined;
            }),
            iconColor: color.white,
            isAlertVisible: false,
        });

        const mouseOut = () => {
            state.click = false;
            onMouseOut();
        };

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
            isMouseOver,
            onMouseOver,
            mouseOut,
            copyText,
        };
    },

};
</script>

<style lang="postcss">

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.p-copy-button {
    display: inline-flex;
    position: relative;
    align-items: center;

    .copy-button-alert {
        @apply flex text-white;
        background-color: rgba(theme('colors.gray.900'), 0.88);
        position: absolute;
        font-weight: 400;
        right: -5.25rem;
        font-size: 0.75rem;
        z-index: 2;
        width: 4.75rem;
        height: 1.5rem;
        border-radius: 0.125rem;
        justify-content: center;
        align-items: center;
        cursor: default;

        span {
            margin-left: 0.313rem;
        }
    }
}

</style>

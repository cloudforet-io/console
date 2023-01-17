<template>
    <div class="p-notification-bar">
        <transition name="slide">
            <div v-if="proxyVisible"
                 class="notification-wrapper"
            >
                <div class="contents-wrapper">
                    <slot />
                </div>
                <p-icon-button class="close-btn"
                               name="ic_delete"
                               size="lg"
                               @click.stop="onClose"
                />
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';

import { styleTypes } from '@/feedbacks/notification/config';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { makeProxy } from '@/utils/composition-helpers';

export default defineComponent({
    name: 'PNotificationBar',
    components: { PIconButton },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
        styleType: {
            type: String,
            default: 'dark',
            validator(val) {
                return styleTypes.includes(val as any);
            },
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });
        const onClose = () => {
            emit('close');
            state.proxyVisible = false;
        };
        return {
            ...toRefs(state),
            onClose,
        };
    },
});
</script>

<style lang="postcss">
.p-notification-bar {
    @apply overflow-hidden;
    .notification-wrapper {
        @apply flex items-center bg-gray-800;
        padding: 1.5rem;
    }
    .contents-wrapper {
        @apply text-white;
        padding-right: 4rem;
        flex-grow: 1;
        font-size: 0.875rem;
        line-height: 1.6;
        max-height: 33vh;
        overflow-y: auto;
        text-align: left;
    }
    .close-btn {
        @apply text-gray-400 border-0;
        margin-left: -3.5rem;
        flex-shrink: 0;
        z-index: 1;
        &.p-icon-button.p-button:not(.disabled):hover {
            @apply bg-transparent text-gray-400;
        }
    }
    .slide-enter-active, .slide-leave-active {
        transition: all 0.2s ease-in-out;
    }
    .slide-enter, .slide-leave-to {
        margin-bottom: -100%;
        transform: translateY(-100%);
    }

    /* responsible size */
    @screen lg {
        .contents-wrapper {
            text-align: center;
        }
    }
}
</style>

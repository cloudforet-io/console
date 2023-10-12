<template>
    <notifications
        class="p-toast-alert"
        :group="group"
        :position="state.position"
        width="320"
        :close-on-click="false"
    >
        <template #body="{item, close}">
            <div class="alert-contents"
                 :class="item.type"
                 @click="close"
            >
                <div class="icon-wrapper">
                    <p-i v-if="item.type === 'success'"
                         name="ic_check"
                         class="item-type-icon"
                         width="1.5rem"
                         height="1.5rem"
                         :color="safe"
                    />
                    <p-i v-if="item.type === 'warning'"
                         name="ic_warning-filled"
                         class="item-type-icon"
                         width="1.5rem"
                         height="1.5rem"
                    />
                    <p-i v-if="item.type === 'alert'"
                         name="ic_error-filled"
                         class="item-type-icon"
                         width="1.5rem"
                         height="1.5rem"
                         color="inherit transparent"
                    />
                    <p-spinner v-if="item.type === 'loading'"
                               class="item-type-icon"
                    />
                </div>
                <div class="content-wrapper"
                     :class="[item.type === 'info' ? 'ml-2' : '']"
                >
                    <a class="title">{{ item.title }}</a>
                    <div v-if="item.text"
                         class="contents"
                    >
                        {{ item.text }}
                    </div>
                </div>
                <div class="button-wrapper">
                    <p-i name="ic_close"
                         class="delete-icon"
                         width="1.5rem"
                         height="1.5rem"
                         color="inherit"
                    />
                </div>
            </div>
        </template>
    </notifications>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { ToastGroup, ToastPosition } from '@/feedbacks/alert/toast-alert/config';
import {
    TOAST_GROUP, TOAST_GROUP_POSITION_MAP,
} from '@/feedbacks/alert/toast-alert/config';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import PI from '@/foundation/icons/PI.vue';

import { safe } from '@/styles/colors.cjs';

/**
 * Used library: vue-notification
 * https://www.npmjs.com/package/vue-notification
 */

interface NoticeAlertProps {
    group: ToastGroup;
}
const props = withDefaults(defineProps<NoticeAlertProps>(), {
    group: TOAST_GROUP.toastTopCenter,
});
const state = reactive({
    position: computed<ToastPosition>(() => TOAST_GROUP_POSITION_MAP[props.group]),
});
</script>

<style lang="postcss">
/* CAUTION: Do not remove 'important'.
 * This resolves the issue where CSS is not being applied due to a change in the timing of the loading of original 'vue-notification-group' libarary's css on the application at running time. */
.vue-notification-group {
    overflow: unset !important;
    z-index: 10000 !important;
}
.vue-notification-wrapper {
    margin: 1rem 0 !important;
    overflow: visible !important;
}

.p-toast-alert {
    margin-top: 4.5rem;
    margin-left: 0;
    margin-right: 0;
    overflow-y: hidden;

    .alert-contents {
        @apply bg-gray-900 rounded-lg;
        position: relative;
        display: flex;
        min-width: 17rem;
        max-width: 30rem;
        opacity: 0.9;
        padding: 0.55rem;
        &.alert {
            .item-type-icon {
                @apply text-red-400;
            }
        }
    }

    .icon-wrapper {
        flex-shrink: 0;
    }
    .item-type-icon {
        float: left;
        padding-right: 0.5rem;
        padding-top: 0.125rem;
    }

    .content-wrapper {
        flex-grow: 1;
        .title {
            @apply text-white;
            display: block;
            font-size: 1rem;
            line-height: 1.375;
            text-transform: capitalize;
        }
        .contents {
            @apply text-gray-300;
            font-size: 0.875rem;
        }
    }

    .button-wrapper {
        @apply text-gray-400;
        margin: auto 0 auto 0.5rem;
        flex-shrink: 0;
        .delete-icon {
            &:hover {
                cursor: pointer;
            }
        }
    }
}
</style>

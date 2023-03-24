<template>
    <portal to="top-notification"
            class="top-notification"
    >
        <p slot-scope="{hasDefaultMessage}">
            <p-notification-bar v-model="visible"
                                :style-type="styleType"
                                @close="handleClose"
            >
                <span v-if="hasDefaultMessage">
                    <portal target="top-notification-message" />
                    {{ $t('APP.TOP_NOTI.PERMISSION_DENIED') }}
                </span>
            </p-notification-bar>
        </p>
    </portal>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PNotificationBar } from '@spaceone/design-system';

import { store } from '@/store';

export default {
    name: 'TopNotification',
    components: { PNotificationBar },
    props: {
        styleType: {
            type: String,
            default: 'dark',
        },
    },
    setup() {
        const state = reactive({
            visible: computed({
                get() { return !store.getters['user/hasPermission'] || store.state.error.visibleAuthorizationError; },
                set(val) { store.commit('error/setVisibleAuthorizationError', val); },
            }),
        });
        const handleClose = () => {
            state.visible = false;
        };
        return {
            ...toRefs(state),
            handleClose,
        };
    },
};
</script>

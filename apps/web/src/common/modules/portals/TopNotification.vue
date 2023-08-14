<script lang="ts" setup>
import { PNotificationBar } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

interface Props {
    styleType?: string;
}

withDefaults(defineProps<Props>(), {
    styleType: 'dark',
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    visible: computed({
        get() { return !store.getters['user/hasPermission'] || store.state.error.visibleAuthorizationError; },
        set(val) { store.commit('error/setVisibleAuthorizationError', val); },
    }),
});
const handleClose = () => {
    state.visible = false;
};

</script>

<template>
    <portal to="top-notification"
            class="top-notification"
    >
        <p :v-slot="{hasDefaultMessage}">
            <p-notification-bar v-model:visible="state.visible"
                                :style-type="styleType"
                                @close="handleClose"
            >
                <span v-if="hasDefaultMessage">
                    <portal target="top-notification-message" />
                    {{ t('APP.TOP_NOTI.PERMISSION_DENIED') }}
                </span>
            </p-notification-bar>
        </p>
    </portal>
</template>


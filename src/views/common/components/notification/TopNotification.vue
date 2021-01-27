<template>
    <portal to="top-notification">
        <p-notification-bar v-model="visible"
                            :style-type="styleType"
        >
            <slot />
        </p-notification-bar>
    </portal>
</template>

<script lang="ts">
import { PNotificationBar } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'TopNotification',
    components: { PNotificationBar },
    props: {
        styleType: {
            type: String,
            default: 'dark',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            visible: true,
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

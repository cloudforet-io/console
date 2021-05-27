<template>
    <p-pane-layout class="content-wrapper">
        <h3 class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
        </h3>
        <h4 class="sub-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
        </h4>
        <p-radio v-for="(item, i) in scheduleMode" :key="i"
                 :selected="item.value" :value="selectedScheduleMode" class="mr-4"
                 @click="changeScheduleMode(item.value)"
        >
            <span class="radio-label" @click="changeScheduleMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="selectedScheduleMode === SCHEDULE_MODE.CUSTOM">
            Custom
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PPaneLayout, PRadio } from '@spaceone/design-system';

enum SCHEDULE_MODE {
    ALL = 'all',
    CUSTOM = 'custom',
}

export default {
    name: 'AddNotificationSchedule',
    components: {
        PPaneLayout,
        PRadio,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            scheduleMode: computed(() => [{
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME'), value: 'all',
            }, {
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.CUSTOM'), value: 'custom',
            }]),
            selectedScheduleMode: 'all',
        });
        const changeScheduleMode = (value) => {
            state.selectedScheduleMode = value;
        };
        return {
            SCHEDULE_MODE,
            ...toRefs(state),
            changeScheduleMode,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content-wrapper {
    padding-left: 1rem;
    padding-top: 2rem;
    padding-bottom: 3.5rem;
}
.content-title {
    font-size: 1.5rem;
    line-height: 135%;
}
.sub-title {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 140%;
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
}
.radio-label {
    font-size: 0.875rem;
    line-height: 150%;
}
</style>

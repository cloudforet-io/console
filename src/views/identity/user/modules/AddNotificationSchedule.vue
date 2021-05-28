<template>
    <div>
        <p-radio v-for="(item, i) in scheduleMode" :key="i"
                 :selected="item.value" :value="selectedScheduleMode" class="mr-4"
                 @click="changeScheduleMode(item.value)"
        >
            <span class="radio-label" @click="changeScheduleMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="selectedScheduleMode === SCHEDULE_MODE.CUSTOM" class="schedule-wrapper">
            <info-message style-type="secondary"
                          :message="$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE_INFO_MSG')"
                          block
            />
            <h5 class="setting">
                {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
            </h5>
        </article>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PPaneLayout, PRadio } from '@spaceone/design-system';
import InfoMessage from '@/common/components/InfoMessage.vue';

enum SCHEDULE_MODE {
    ALL = 'all',
    CUSTOM = 'custom',
}

export default {
    name: 'AddNotificationSchedule',
    components: {
        PPaneLayout,
        PRadio,
        InfoMessage,
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
.radio-label {
    font-size: 0.875rem;
    line-height: 150%;
}
.schedule-wrapper {
    margin-top: 1.25rem;
    .setting {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 1.125rem;
    }
}
</style>

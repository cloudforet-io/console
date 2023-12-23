<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PRadio, PCheckbox } from '@spaceone/design-system';

import { i18n } from '@/translations';

import type { NotificationAddFormTopicPayload } from '@/services/my-page/types/notification-add-form-type';

const TOPIC_LIST = [
    { label: 'Alert', value: 'monitoring.Alert' },
    { label: 'Budget', value: 'cost_analysis.Budget' },
];

const props = withDefaults(defineProps<{
    topic: string[];
    topicMode: boolean;
}>(), {
    topic: () => [],
    topicMode: false,
});

const emit = defineEmits<{(event: 'change', payload: NotificationAddFormTopicPayload): void;
}>();

const state = reactive({
    topicModeList: computed<{ label: TranslateResult; value: boolean}[]>(() => [{
        label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL'), value: false,
    }, {
        label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ON_TOPIC'), value: true,
    }]),
    isTopicModeSelected: props.topicMode ? props.topicMode : false,
    selectedTopic: Array.isArray(props.topic) ? props.topic : [] as string[],
    isTopicValid: computed<boolean>(() => !state.isTopicModeSelected || (state.isTopicModeSelected && state.selectedTopic.length > 0)),
});

const emitChange = () => {
    emit('change', {
        topicMode: state.isTopicModeSelected,
        selectedTopic: state.selectedTopic,
        isTopicValid: state.isTopicValid,
    });
};
const onChangeTopicMode = (value: boolean) => {
    state.isTopicModeSelected = value;
    emitChange();
};

const onChangeTopic = (topics: string[]) => {
    state.selectedTopic = topics;
    emitChange();
};
</script>

<template>
    <div>
        <p-radio v-for="(item, i) in state.topicModeList"
                 :key="i"
                 :selected="item.value"
                 :value="state.isTopicModeSelected"
                 class="mr-4"
                 @change="onChangeTopicMode"
        >
            <span class="radio-label">{{ item.label }}</span>
        </p-radio>
        <article v-if="state.isTopicModeSelected"
                 class="topic-wrapper"
        >
            <div class="topic-content-wrapper">
                <h5 class="setting">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
                </h5>
                <p-checkbox v-for="item in TOPIC_LIST"
                            :key="item.value"
                            :selected="state.selectedTopic"
                            :value="item.value"
                            :invalid="!state.isTopicValid"
                            @change="onChangeTopic"
                >
                    <span class="topic-label">{{ item.label }}</span>
                </p-checkbox>
            </div>
        </article>
        <p v-if="!state.isTopicValid"
           class="invalid-text"
        >
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC_REQUIRED') }}
        </p>
    </div>
</template>

<style lang="postcss" scoped>
.radio-label {
    font-size: 0.875rem;
    line-height: 150%;
}
.topic-wrapper {
    margin-top: 1.375rem;
    .setting {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 1.125rem;
    }
}

.invalid-text {
    @apply text-red-500;
    font-size: 0.875rem;
    line-height: 150%;
}
.topic-label {
    min-width: 6.25rem;
    margin-right: 0.5rem;
    margin-left: 0.25rem;
}
</style>

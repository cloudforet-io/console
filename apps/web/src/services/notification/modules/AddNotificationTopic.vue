<script lang="ts" setup>
import { PRadio, PCheckbox } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

const TOPIC_LIST = [
    { label: 'Alert', value: 'monitoring.Alert' },
    { label: 'Budget', value: 'cost_analysis.Budget' },
];

interface Props {
    topic: string[];
    topicMode: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    topic: () => [],
    topicMode: false,
});
const emit = defineEmits<{(e: 'change', value?: {
        topicMode: boolean;
        selectedTopic: string[];
        isTopicValid: boolean;
    }): void;
}>();
const { t } = useI18n();

const state = reactive({
    topicModeList: computed(() => [{
        label: t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL'), value: false,
    }, {
        label: t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ON_TOPIC'), value: true,
    }]),
    isTopicModeSelected: props.topicMode ? props.topicMode : false,
    selectedTopic: props.topic.length > 0 ? props.topic : [] as string[],
    isTopicValid: computed(() => !state.isTopicModeSelected || (state.isTopicModeSelected && state.selectedTopic.length > 0)),
});

const emitChange = () => {
    emit('change', {
        topicMode: state.isTopicModeSelected,
        selectedTopic: state.selectedTopic,
        isTopicValid: state.isTopicValid,
    });
};
const onChangeTopicMode = (value) => {
    state.isTopicModeSelected = value;
    emitChange();
};

const onChangeTopic = (value) => {
    state.selectedTopic = value;
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
                 @click="onChangeTopicMode(item.value)"
        >
            <span class="radio-label"
                  @click="onChangeTopicMode(item.value)"
            >{{ item.label }}</span>
        </p-radio>
        <article v-if="state.isTopicModeSelected"
                 class="topic-wrapper"
        >
            <div class="topic-content-wrapper">
                <h5 class="setting">
                    {{ t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
                </h5>
                <p-checkbox v-for="item in TOPIC_LIST"
                            :key="item.value"
                            v-model:value="state.selectedTopic"
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
            {{ t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC_REQUIRED') }}
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

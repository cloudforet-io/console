<template>
    <div>
        <p-radio v-for="(item, i) in topicModeList" :key="i"
                 :selected="item.value" :value="isTopicModeSelected" class="mr-4"
                 @click="onChangeTopicMode(item.value)"
        >
            <span class="radio-label" @click="onChangeTopicMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="isTopicModeSelected" class="topic-wrapper">
            <div class="topic-content-wrapper" :class="{'invalid': !isTopicValid}">
                <h5 class="setting">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
                </h5>
                <p-check-box v-for="item in TOPIC_LIST" :key="item.value"
                             v-model="selectedTopic"
                             :value="item.value"
                             :invalid="!isTopicValid"
                             @change="onChangeTopic"
                >
                    <span class="topic-label">{{ item.label }}</span>
                </p-check-box>
            </div>
        </article>
        <p v-if="!isTopicValid" class="invalid-text">
            Required
        </p>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PRadio, PCheckBox } from '@spaceone/design-system';

const TOPIC_LIST = [
    { label: 'monitoring.Alert', value: 'monitoring.Alert' },
    { label: 'billing.Budget', value: 'cost_analysis.Budget' },
];

export default {
    name: 'AddNotificationTopic',
    components: {
        PRadio,
        PCheckBox,
    },
    props: {
        topic: {
            type: [Array, String],
            default: () => [],
        },
        topicMode: {
            type: Boolean,
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            topicModeList: computed(() => [{
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL'), value: false,
            }, {
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ON_TOPIC'), value: true,
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

        return {
            TOPIC_LIST,
            ...toRefs(state),
            onChangeTopicMode,
            onChangeTopic,
        };
    },
};
</script>

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

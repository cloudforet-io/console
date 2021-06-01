<template>
    <div>
        <p-radio v-for="(item, i) in topicMode" :key="i"
                 :selected="item.value" :value="selectedTopicMode" class="mr-4"
                 @click="changeTopicMode(item.value)"
        >
            <span class="radio-label" @click="changeTopicMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="selectedTopicMode === TOPIC_MODE.TOPIC" class="topic-wrapper">
            <h5 class="setting">
                {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING') }}
            </h5>
            <p-check-box v-for="item in TOPIC_LIST" :key="item.value"
                         v-model="selectedTopic"
                         :value="item.value"
            >
                <span class="topic-label">{{ item.label }}</span>
            </p-check-box>
        </article>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PRadio, PCheckBox } from '@spaceone/design-system';

enum TOPIC_MODE {
    ALL = 'all',
    TOPIC = 'topic',
}

const TOPIC_LIST = [
    { label: 'Alert', value: 'monitoring.Alert' },
];

export default {
    name: 'AddNotificationTopic',
    components: {
        PRadio,
        PCheckBox,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            topicMode: computed(() => [{
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL'), value: 'all',
            }, {
                label: vm.$t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ON_TOPIC'), value: 'topic',
            }]),
            selectedTopicMode: 'all',
            selectedTopic: [] as string[],
        });
        const changeTopicMode = (value) => {
            state.selectedTopicMode = value;
        };
        return {
            TOPIC_MODE,
            TOPIC_LIST,
            ...toRefs(state),
            changeTopicMode,
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
    margin-top: 2.625rem;
    .setting {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 1.125rem;
    }
}
.topic-label {
    min-width: 6.25rem;
    margin-right: 0.5rem;
}
</style>

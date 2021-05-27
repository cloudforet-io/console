<template>
    <p-pane-layout class="content-wrapper">
        <h3 class="content-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
        </h3>
        <h4 class="sub-title">
            {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
        </h4>
        <p-radio v-for="(item, i) in topicMode" :key="i"
                 :selected="item.value" :value="selectedTopicMode" class="mr-4"
                 @click="changeTopicMode(item.value)"
        >
            <span class="radio-label" @click="changeTopicMode(item.value)">{{ item.label }}</span>
        </p-radio>
        <article v-if="selectedTopicMode === TOPIC_MODE.TOPIC">
            Topic
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PPaneLayout, PRadio } from '@spaceone/design-system';

enum TOPIC_MODE {
    ALL = 'all',
    TOPIC = 'topic',
}

export default {
    name: 'AddNotificationTopic',
    components: {
        PPaneLayout,
        PRadio,
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
        });
        const changeTopicMode = (value) => {
            state.selectedTopicMode = value;
        };
        return {
            TOPIC_MODE,
            ...toRefs(state),
            changeTopicMode,
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

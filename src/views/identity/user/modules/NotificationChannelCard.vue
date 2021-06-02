<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <div class="left-section">
                <p-toggle-button :value="isActivated"
                                 @change="onToggleChange"
                />
                <span class="card-title">SMS</span>
                <p-badge v-if="channelData.notification_level" outline style-type="gray">
                    Lv1
                </p-badge>
            </div>
            <p-icon-button name="ic_trashcan" width="1.5rem" height="1.5rem" />
        </div>
        <ul class="card-body">
            <li class="content-wrapper" :class="{'edit-mode': isNameEditMode}">
                <p class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.CHANNEL_NAME') }}
                </p>
                <div v-if="isNameEditMode" class="content">
                    <p-text-input v-model="channelNameForEdit"
                                  class="block"
                    />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.NAME)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p>{{ channelData.name }}</p>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.NAME)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isDataEditMode}">
                <p v-for="(item, index) in Object.keys(channelData.data)" :key="`channel-data-key-${index}`" class="content-title">
                    {{ item }}
                </p>
                <div v-if="isDataEditMode" class="content">
                    <p v-for="(item, index) in Object.values(channelData.data)" :key="`channel-editable-data-value-${index}`">
                        <p-text-input v-model="dataListForEdit[index]"
                                      class="block"
                        />
                    </p>
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.DATA)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p v-for="(item, index) in Object.values(channelData.data)" :key="`channel-data-value-${index}`">
                        {{ item }}
                    </p>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.DATA)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isScheduleEditMode}">
                <span class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </span>
                <div v-if="isScheduleEditMode" class="content">
                    <add-notification-schedule :schedule="channelData.schedule" @change="onChangeSchedule" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.SCHEDULE)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <p v-if="channelData.schedule">
                        {{ channelData.schedule.day_of_week }} <br>
                        {{ channelData.schedule.start_hour }} ~ {{ channelData.schedule.end_hour }}
                    </p>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.SCHEDULE)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper" :class="{'edit-mode': isTopicEditMode}">
                <span class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </span>
                <div v-if="isTopicEditMode" class="content">
                    <add-notification-topic :topic="channelData.topic" :topic-mode="channelData.is_subscribe" @change="onChangeTopic" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" @click="cancelEdit(EDIT_TYPE.TOPIC)">
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            class="text-button"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
                <div v-else class="content">
                    <ul>
                        <li v-for="(item, index) in channelData.subscriptions" :key="`topic-${index}`">
                            <p-tag :deletable="false">
                                {{ item }}
                            </p-tag>
                        </li>
                    </ul>
                    <button class="edit-btn" @click="startEdit(EDIT_TYPE.TOPIC)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </div>
            </li>
            <p-divider />
        </ul>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PBadge, PDivider, PI, PIconButton, PPaneLayout, PTag, PToggleButton, PButton, PTextInput,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import AddNotificationSchedule from '@/views/identity/user/modules/AddNotificationSchedule.vue';
import AddNotificationTopic from '@/views/identity/user/modules/AddNotificationTopic.vue';
import AddNotificationData from '@/views/identity/user/modules/AddNotificationData.vue';

enum EDIT_TYPE {
    NAME = 'name',
    DATA = 'data',
    SCHEDULE = 'schedule',
    TOPIC = 'topic',
}

export default {
    name: 'NotificationChannelCard',
    components: {
        AddNotificationTopic,
        AddNotificationSchedule,
        PPaneLayout,
        PToggleButton,
        PI,
        PIconButton,
        PButton,
        PTextInput,
        PBadge,
        PDivider,
        PTag,
    },
    props: {
        channelData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            isActivated: true,
            isNameEditMode: false,
            isDataEditMode: false,
            isScheduleEditMode: false,
            isTopicEditMode: false,
            //
            channelNameForEdit: props.channelData.name,
            dataListForEdit: [],
            scheduleForEdit: props.channelData.schedule || [],
            topicModeForEdit: undefined,
            topicForEdit: props.channelData.subscriptions,
        });
        const onToggleChange = () => {
            console.log('toggle changed!');
        };

        const startEdit = (type: EDIT_TYPE) => {
            if (type === EDIT_TYPE.NAME) state.isNameEditMode = true;
            if (type === EDIT_TYPE.DATA) state.isDataEditMode = true;
            if (type === EDIT_TYPE.SCHEDULE) state.isScheduleEditMode = true;
            if (type === EDIT_TYPE.TOPIC) state.isTopicEditMode = true;
        };
        const cancelEdit = (type: EDIT_TYPE) => {
            if (type === EDIT_TYPE.NAME) state.isNameEditMode = false;
            if (type === EDIT_TYPE.DATA) state.isDataEditMode = false;
            if (type === EDIT_TYPE.SCHEDULE) state.isScheduleEditMode = false;
            if (type === EDIT_TYPE.TOPIC) state.isTopicEditMode = false;
        };

        const onChangeSchedule = (value) => {
            console.log('schedule test', value);
        };

        const onChangeTopic = (value) => {
            console.log('topic test', value);
        };
        const saveChange = () => {

        };
        return {
            EDIT_TYPE,
            ...toRefs(state),
            onToggleChange,
            startEdit,
            cancelEdit,
            onChangeSchedule,
            onChangeTopic,
            saveChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.channel-card-wrapper {
    min-height: 13.375rem;
    padding: 1rem 1rem 2.531rem;
}
.card-header {
    display: flex;
    justify-content: space-between;
    .card-title {
        @apply font-bold;
        font-size: 1rem;
        line-height: 160%;
        margin-left: 1rem;
        margin-right: 0.5rem;
    }
}
.card-body {
    display: flex;
    flex-direction: column;
    margin-top: 0.75rem;
}
.content-wrapper {
    display: flex;
    flex-direction: row;
    min-height: 2.5rem;
    align-items: center;
    &.edit-mode {
        @apply bg-blue-100;
    }
    .content-title {
        @apply text-gray-600;
        min-width: 10.5rem;
        padding-left: 1rem;
        font-size: 0.875rem;
        line-height: 170%;
    }
    .content {
        display: inherit;
        width: 100%;
        justify-content: space-between;
        font-size: 0.875rem;
        line-height: 170%;
        padding: 0.75rem 1rem;
    }
    .edit-btn {
        @apply text-blue-600;
        padding-right: 0.5rem;
        line-height: 160%;
        .edit-icon {
            margin-right: 0.25rem;
        }
        &:hover, &:active {
            @apply cursor-pointer;
        }
    }
    .button-group {
        justify-content: flex-end;
        flex-shrink: 0;
        .text-button {
            height: 1.5rem;
        }
    }
}

</style>

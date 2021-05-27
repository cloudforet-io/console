<template>
    <p-pane-layout class="channel-card-wrapper">
        <div class="card-header">
            <div class="left-section">
                <p-toggle-button :value="isActivated"
                                 @change="onToggleChange"
                />
                <span class="card-title">SMS</span>
                <p-badge outline style-type="gray">
                    Lv1
                </p-badge>
            </div>
            <p-icon-button name="ic_trashcan" width="1.5rem" height="1.5rem" />
        </div>
        <ul class="card-body">
            <li class="content-wrapper">
                <span class="content-title">
                    {{$t('IDENTITY.USER.NOTIFICATION.FORM.PHONE_NUMBER')}}
                </span>
                <div class="content">
                    <p>010-2222-3333</p>
                    <p class="edit-btn">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{$t('IDENTITY.USER.NOTIFICATION.EDIT')}}
                    </p>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper">
                <span class="content-title">
                    {{$t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE')}}
                </span>
                <div class="content">
                    <p>
                        Custom : Monday 10:00 AM to 10:00 PM, Tuesday 10:00 AM
                        to 10:00 PM, Thursday  10:00 AM to 10:00 PM
                    </p>
                    <p class="edit-btn">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{$t('IDENTITY.USER.NOTIFICATION.EDIT')}}
                    </p>
                </div>
            </li>
            <p-divider />
            <li class="content-wrapper">
                <span class="content-title">
                    {{$t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC')}}
                </span>
                <div class="content">
                    <p-tag :deletable="false">Topic1</p-tag>
                    <p class="edit-btn">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{$t('IDENTITY.USER.NOTIFICATION.EDIT')}}
                    </p>
                </div>
            </li>
            <p-divider />
        </ul>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PBadge, PDivider, PI, PIconButton, PPaneLayout, PTag, PToggleButton,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'NotificationChannelCard',
    components: {
        PPaneLayout,
        PToggleButton,
        PI,
        PIconButton,
        PBadge,
        PDivider,
        PTag,
    },
    setup() {
        const state = reactive({
            isActivated: true,
        });
        const onToggleChange = () => {
            console.log('toggle changed!');
        };
        return {
            ...toRefs(state),
            onToggleChange,
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
    }
    .edit-btn {
        @apply text-blue-600;
        padding-right: 0.5rem;
        line-height: 160%;
        .edit-icon {
            margin-right: 0.25rem;
        }
    }

}
</style>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PI, PIconButton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import { NOTIFICATION_TYPE_ICONS } from '@/common/modules/navigations/gnb/modules/gnb-noti/type';

import { green, red, yellow } from '@/styles/colors';

interface Props {
    isRead: boolean;
    title: string;
    createdAt?: string;
    dateHeader?: TranslateResult | string;
    icon?: string;
    writer?: string;
    deletable?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(event: 'select'): void;
    (event: 'delete'): void;
}>();

const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    occurred: computed<string>(() => {
        if (!props.createdAt) return '';
        return dayjs.tz(dayjs.utc(props.createdAt), state.timezone).format('YYYY-MM-DD HH:mm');
    }),
    iconColor: computed<string|undefined>(() => {
        if (props.icon === NOTIFICATION_TYPE_ICONS.SUCCESS) {
            return green[500];
        }
        if (props.icon === NOTIFICATION_TYPE_ICONS.ERROR) {
            return red[400];
        }
        if (props.icon === NOTIFICATION_TYPE_ICONS.WARNING) {
            return yellow[500];
        }
        return undefined;
    }),
});

/* Event */
const handleClickItem = () => {
    emit('select');
};
const handleClickDeleteButton = (event) => {
    event.stopPropagation();
    emit('delete');
};

</script>

<template>
    <div class="gnb-noti-item">
        <p v-if="props.dateHeader"
           class="date-header"
        >
            {{ props.dateHeader }}
        </p>
        <div class="item-wrapper"
             @click="handleClickItem"
        >
            <span class="new-icon"
                  :class="{ invisible: props.isRead }"
            />
            <div class="contents-wrapper">
                <p class="title">
                    <p-i v-if="props.icon"
                         :name="props.icon"
                         :color="state.iconColor"
                         width="1rem"
                         height="1rem"
                         class="mr-1"
                    />
                    <span>{{ props.title }}</span>
                </p>
                <div class="additional-text">
                    {{ state.occurred }} <span v-if="props.writer">· {{ props.writer }}</span>
                </div>
            </div>
            <p-icon-button v-if="props.deletable"
                           class="delete-button"
                           name="ic_close"
                           size="sm"
                           @click="handleClickDeleteButton"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-noti-item {
    margin: 0.125rem 0;
    .date-header {
        @apply text-gray-500;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.5;
        margin-top: 0.75rem;
        margin-bottom: 0.25rem;
        padding: 0 0.75rem;
    }
    .item-wrapper {
        @apply rounded-lg;
        display: flex;
        position: relative;
        align-items: baseline;
        cursor: pointer;
        padding: 0.5rem;

        @media (hover: hover) {
            &:hover {
                @apply bg-blue-100;
                .delete-button {
                    visibility: visible;
                }
            }
        }
        .new-icon {
            @apply bg-blue-500;
            min-width: 0.5rem;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            margin-right: 0.125rem;
        }
        .contents-wrapper {
            flex-grow: 1;
            .title {
                font-size: 0.875rem;
                line-height: 1.25;
                font-weight: bold;
                text-transform: capitalize;
                vertical-align: middle;
                margin-bottom: 0.125rem;
            }
            .additional-text {
                @apply text-gray-400;
                margin-top: 0.125rem;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
        .delete-button {
            visibility: hidden;
            position: absolute;
            top: 0.25rem;
            right: 0.5rem;
        }
    }
}
</style>

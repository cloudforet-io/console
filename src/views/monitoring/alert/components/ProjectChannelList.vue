<template>
    <div v-if="channelFormatter(notificationLevel).length > 0" class="project-channel-list">
        <div v-for="(channel, cIdx) in channelFormatter(notificationLevel)" :key="`channel-${cIdx}`"
             :class="{ disabled: channel.state === CHANNEL_STATE.DISABLED }"
             class="channel-wrapper"
        >
            <p class="title">
                [{{ CHANNEL_SCHEMA[channel.schema] }}] {{ channel.name }}
                <p-i name="ic_bell" color="inherit" class="ml-1"
                     width="1rem" height="1rem"
                />
                {{ channel.state === CHANNEL_STATE.ENABLED ? 'ON' : 'OFF' }}
            </p>
            <div v-if="channel.schema === 'spaceone_user' && channel.data && Array.isArray(channel.data.users)" class="info">
                <p v-for="(user, uIdx) in channel.data.users" :key="`user-${uIdx}`">
                    {{ user }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { filter } from 'lodash';

import { PI } from '@spaceone/design-system';


const CHANNEL_SCHEMA = Object.freeze({
    spaceone_user: 'Member',
    slack_webhook: 'Slack',
});

const CHANNEL_STATE = Object.freeze({
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
});

export default {
    name: 'ProjectChannelList',
    components: {
        PI,
    },
    props: {
        projectChannels: {
            type: Array,
            default: () => ({}),
        },
        notificationLevel: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const channelFormatter = level => filter(props.projectChannels, { notification_level: level });

        return {
            CHANNEL_STATE,
            CHANNEL_SCHEMA,
            channelFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-channel-list {
    @apply bg-white rounded;
    font-size: 0.75rem;
    line-height: 1.5;
    padding: 0.5rem;
    margin-top: 0.5rem;

    .channel-wrapper {
        .title {
            @apply text-blue-900;
            display: flex;
            align-items: center;
            font-weight: bold;
        }
        .info {
            @apply text-gray-700;
        }

        &.disabled {
            .title {
                @apply text-gray-300;
            }
            .info {
                @apply text-gray-300;
            }
        }
    }
}
</style>

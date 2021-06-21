<template>
    <div v-if="channelFormatter(notificationLevel).length > 0" class="project-channel-list">
        <div v-for="(channel, cIdx) in channelFormatter(notificationLevel)" :key="`channel-${cIdx}`"
             :class="{ disabled: channel.state === CHANNEL_STATE.DISABLED }"
             class="channel-wrapper"
        >
            <p class="title">
                [{{ protocolNameFormatter(channel.protocol_id) }}] {{ channel.name }}
                <p-i name="ic_bell" color="inherit" class="ml-1"
                     width="1rem" height="1rem"
                />
                {{ channel.state === CHANNEL_STATE.ENABLED ? 'ON' : 'OFF' }}
            </p>
            <p v-for="(user, uIdx) in channel.data.users" :key="`user-${uIdx}`" class="info">
                {{ user }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get, filter } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import { PI } from '@spaceone/design-system';

import { store } from '@/store';


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
        const state = reactive({
            protocols: computed(() => store.state.resource.protocol.items),
        });

        const channelFormatter = level => filter(props.projectChannels, { notification_level: level });
        const protocolNameFormatter = (protocolId) => {
            const protocolName = get(state.protocols, protocolId);
            return protocolName ? protocolName.label : protocolId;
        };

        return {
            ...toRefs(state),
            CHANNEL_STATE,
            channelFormatter,
            protocolNameFormatter,
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
    margin-top: 0.375rem;

    .channel-wrapper {
        padding-bottom: 0.25rem;
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

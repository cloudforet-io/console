<script setup lang="ts">
import { computed, reactive } from 'vue';

import { get, filter } from 'lodash';

import { PI } from '@cloudforet/mirinae';

import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProtocolReferenceMap } from '@/store/reference/protocol-reference-store';

const allReferenceStore = useAllReferenceStore();

const CHANNEL_STATE = Object.freeze({
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
});

const props = withDefaults(defineProps<{
    projectChannels: ProjectChannelModel[];
    notificationLevel?: string;
}>(), {
    projectChannels: () => [],
    notificationLevel: undefined,
});

const state = reactive({
    protocols: computed<ProtocolReferenceMap>(() => allReferenceStore.getters.protocol),
});

const channelFormatter = (level?: string) => {
    if (level === 'ALL') {
        return props.projectChannels;
    }
    return filter(props.projectChannels, { notification_level: level });
};
const protocolNameFormatter = (protocolId) => {
    const protocolName = get(state.protocols, protocolId);
    return protocolName ? protocolName.label : protocolId;
};
</script>

<template>
    <div v-if="channelFormatter(props.notificationLevel).length > 0"
         class="project-channel-list"
    >
        <div v-for="(channel, cIdx) in channelFormatter(props.notificationLevel)"
             :key="`channel-${cIdx}`"
             :class="{ disabled: channel.state === CHANNEL_STATE.DISABLED }"
             class="channel-wrapper"
        >
            <p class="title">
                [{{ protocolNameFormatter(channel.protocol_id) }}] {{ channel.name }}
                <span class="on-off">
                    <p-i name="ic_gnb_bell"
                         color="inherit"
                         class="ml-1"
                         width="1rem"
                         height="1rem"
                    />
                    {{ channel.state === CHANNEL_STATE.ENABLED ? 'ON' : 'OFF' }}
                </span>
            </p>
            <template v-if="Array.isArray(channel.data)">
                <p v-for="(user, uIdx) in channel.data.users"
                   :key="`user-${uIdx}`"
                   class="info"
                >
                    {{ user }}
                </p>
            </template>
        </div>
    </div>
</template>

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
            font-weight: bold;
            .on-off {
                flex-shrink: 0;
            }
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

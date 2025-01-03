<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});

const state = reactive({
    protocolList: computed<{ icon: string; label: string; value: string; }[]>(() => userGroupPageState.protocolList.map((protocol) => ({
        icon: storeState.plugins[protocol.plugin_info.plugin_id]?.icon || '',
        label: protocol.name,
        value: protocol.protocol_id,
    }))),
    selectedProtocol: {},
});

/* Component */
const handleSelectChannel = (selectedProtocol) => {
    notificationChannelCreateFormStore.$patch((_state) => {
        _state.state.selectedProtocol = {
            name: selectedProtocol.label,
            protocol_id: selectedProtocol.value,
            icon: selectedProtocol.icon,
        };
    });
};
</script>

<template>
    <div class="select-channel-card">
        <p-select-card v-for="(channel, idx) in state.protocolList"
                       :key="`channel-${idx}`"
                       v-model="state.selectedProtocol"
                       :selected="state.selectedProtocol"
                       class="card"
                       :multi-selectable="false"
                       :show-select-marker="false"
                       :value="channel"
                       @change="handleSelectChannel"
        >
            <div class="card-item">
                <p-lazy-img v-if="channel.icon"
                            :src="assetUrlConverter(channel.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_notification-protocol_envelope"
                            class="image"
                />
                <p class="w-30">
                    {{ channel.label }}
                </p>
            </div>
            <!--            <template></template>-->
        </p-select-card>
    </div>
</template>

<style scoped lang="postcss">
.select-channel-card {
    @apply grid grid-cols-3 grid-rows-3;
    margin-bottom: 57px;
    gap: 0.5rem;
    .card {
        height: 5.625rem;
        padding: 1.5rem;
        .card-item {
            @apply flex items-center w-full;
            gap: 1rem;
            .image {
                margin-top: 0.8rem;
            }
        }
    }
}
</style>

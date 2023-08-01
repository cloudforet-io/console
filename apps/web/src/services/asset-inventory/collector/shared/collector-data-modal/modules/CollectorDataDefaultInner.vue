<template>
    <div class="collector-data-default-inner">
        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DESCRIPTION') }}</span>
        <div class="accounts-wrapper">
            <p-lazy-img :src="props.icon"
                        width="1rem"
                        height="1rem"
                        class="plugin-icon"
            />
            <div v-if="collectorDataModalState.collectDataType === COLLECT_DATA_TYPE.ENTIRE">
                <span>{{ props.name }} {{ $t('INVENTORY.COLLECTOR.ACCOUNT') }}</span>
                <span v-if="collectorDataModalState.secrets && collectorDataModalState.secrets.length > 0">
                    ({{ collectorDataModalState.secrets && collectorDataModalState.secrets.length }})
                </span>
            </div>
            <span v-else>{{ state.serviceAccountName || '' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PLazyImg } from '@spaceone/design-system';

import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

interface Props {
    name: string;
    icon: string;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    icon: '',
});

const state = reactive({
    serviceAccountName: computed(() => {
        const selectedSecret = collectorDataModalState.selectedSecret;
        if (!selectedSecret) return '';

        const id = selectedSecret.service_account_id;
        const fullName = selectedSecret.name;
        return fullName.split(id)[0];
    }),
});
</script>

<style lang="postcss" scoped>
.collector-data-default-inner {
    .accounts-wrapper {
        @apply flex items-center bg-gray-100 text-paragraph-md;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }
}
</style>

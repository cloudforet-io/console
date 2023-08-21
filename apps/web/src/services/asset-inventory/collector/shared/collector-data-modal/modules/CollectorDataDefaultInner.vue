<template>
    <div class="collector-data-default-inner">
        <span>{{ t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DESCRIPTION') }}</span>
        <div class="accounts-wrapper">
            <p-lazy-img :src="props.icon"
                        width="1rem"
                        height="1rem"
                        class="plugin-icon"
            />
            <div v-if="collectorDataModalState.collectDataType === COLLECT_DATA_TYPE.ENTIRE">
                <span>{{ props.name }} {{ t('INVENTORY.COLLECTOR.ACCOUNT') }}</span>
                <span v-if="props.secretsCount > 0">
                    ({{ props.secretsCount }})
                </span>
            </div>
            <span v-else>{{ props.name }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/collector/shared/collector-data-modal/type';

const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;

interface Props {
    name: string;
    icon: string;
    secretsCount: number;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    icon: '',
    secretsCount: 0,
});

const { t } = useI18n();
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

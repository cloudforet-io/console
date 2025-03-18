<script setup lang="ts">
import { computed, defineProps, reactive } from 'vue';

import { PLink, PDivider, PFieldTitle } from '@cloudforet/mirinae';


import type { CollectorModel } from '@/schema/inventory/collector/model';
import type { PluginModel } from '@/schema/repository/plugin/model';

import CollectorPluginContents from '@/services/asset-inventory/components/CollectorPluginContents.vue';



const props = defineProps<{
    plugin?: PluginModel;
    collector?: CollectorModel|null;
    showMinimal?: boolean;
}>();

const state = reactive({
    description: computed(() => props.plugin?.tags?.long_description),
});
</script>

<template>
    <div class="collector-plugin-info">
        <collector-plugin-contents :plugin="props.plugin"
                                   :hide-labels="props.showMinimal"
                                   emphasize-name
        >
            <template v-if="!props.showMinimal"
                      #contents
            >
                <div class="collector-contents-wrapper">
                    <div class="collector-contents">
                        <p-field-title size="sm"
                                       color="gray"
                                       font-weight="regular"
                        >
                            {{ $t('INVENTORY.COLLECTOR.DETAIL.AUTO_UPGRADE') }}
                        </p-field-title>
                        <div class="value">
                            {{ props.collector?.plugin_info?.upgrade_mode === 'AUTO' ? 'ON' : 'OFF' }}
                        </div>
                    </div>
                    <div class="collector-contents">
                        <p-field-title size="sm"
                                       color="gray"
                                       font-weight="regular"
                        >
                            {{ $t('INVENTORY.COLLECTOR.DETAIL.VERSION') }}
                        </p-field-title>
                        <div class="value">
                            {{ props.collector?.plugin_info?.version }}
                        </div>
                    </div>
                </div>
            </template>
        </collector-plugin-contents>
        <template v-if="!props.showMinimal">
            <p-divider />
            <p v-if="state.description"
               class="plugin-desc"
            >
                {{ state.description }}
            </p>
            <p-link v-if="props.plugin?.tags?.link"
                    size="sm"
                    action-icon="external-link"
                    highlight
                    class="plugin-link"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.LEARN_MORE') }}
            </p-link>
        </template>
    </div>
</template>

<style scoped lang="postcss">
.collector-plugin-info {
    margin-bottom: 1.5rem;
    max-width: 1048px;
    .collector-contents-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        > .p-field-title {
            margin-bottom: 0.12rem;
        }
        > .collector-contents {
            padding-right: 0.5rem;
            .value {
                @apply text-label-sm;
            }
        }
    }
    > .p-divider {
        margin: 1.5rem 0;
    }
    .plugin-desc {
        @apply text-paragraph-md;
        margin-bottom: 0.5rem;
    }
}
</style>

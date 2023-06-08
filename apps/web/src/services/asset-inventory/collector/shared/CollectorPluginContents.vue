<template>
    <div class="plugin-data-contents">
        <p-lazy-img :src="state.icon"
                    class="plugin-icon"
                    width="2.5rem"
                    height="2.5rem"
        />
        <div class="contents">
            <p class="plugin-name">
                {{ state.name }} <span v-if="state.isBeta"
                                       class="beta"
                >{{ $t('INVENTORY.COLLECTOR.CREATE.BETA') }}</span>
            </p>
            <div class="plugin-description">
                <span class="plugin-description-text">
                    {{ state.description }}
                </span><p-anchor v-if="state.pluginDetailLink"
                                 size="sm"
                                 :highlight="true"
                >
                    {{ $t('INVENTORY.COLLECTOR.CREATE.LEARN_MORE') }}
                </p-anchor>
            </div>
            <div class="label-container">
                <p-label v-for="(label, idx) in state.labels"
                         :key="`${label}-${idx}`"
                         class="mb-1"
                         :text="label"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    defineProps, reactive, computed,
} from 'vue';

import {
    PAnchor, PLazyImg, PLabel,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { PluginReferenceItem, PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import type { CollectorPluginModel, RepositoryPluginModel } from '@/services/asset-inventory/collector/type';

// TODO: Add plugin data type
interface Props {
    plugin?: CollectorPluginModel|RepositoryPluginModel|null;
}

const props = defineProps<Props>();

const state = reactive({
    icon: computed<string>(() => state.pluginItem?.tags.icon ?? ''),
    name: computed<string>(() => state.pluginItem?.name ?? state.pluginItem?.key ?? ''),
    description: computed<string>(() => state.pluginItem?.description ?? ''),
    labels: computed<string[]>(() => (props.plugin as RepositoryPluginModel)?.labels ?? []), // it is empty with collector plugin
    isBeta: computed<boolean>(() => !!(props.plugin as RepositoryPluginModel)?.tags?.beta ?? false), // it is empty with collector plugin
    pluginDetailLink: computed<string>(() => state.pluginItem?.link ?? ''),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    pluginItem: computed<PluginReferenceItem|undefined>(() => {
        if (!props.plugin) return undefined;
        return state.plugins[props.plugin.plugin_id];
    }),
});

// init reference data
(async () => {
    await store.dispatch('reference/plugin/load');
})();


</script>

<style lang="postcss" scoped>
.plugin-data-contents {
    @apply flex;
    width: 100%;
    .plugin-icon {
        flex-shrink: 0;
        margin-right: 1.5rem;
    }
    .contents {
        @apply flex flex-col;
        width: 100%;

        .plugin-name {
            @apply text-label-md text-gray-900;
            margin-bottom: 0.25rem;
            .beta {
                @apply text-label-xs text-coral-500 font-normal;
            }
        }
        .plugin-description {
            @apply inline-flex items-end gap-1;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            .plugin-description-text {
                @apply text-label-sm text-gray-500 truncate;
                max-width: 18.75rem;
                flex-shrink: 1;
            }
        }
    }
}

@screen tablet {
    .plugin-data-contents {
        .contents {
            .plugin-description {
                .plugin-description-text {
                    white-space: normal;
                }
            }
            .label-container {
                @apply flex flex-wrap;
            }
        }
    }
}

</style>

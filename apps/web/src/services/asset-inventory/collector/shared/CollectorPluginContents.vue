<template>
    <div class="plugin-data-contents">
        <p-lazy-img :src="state.icon"
                    class="plugin-icon"
                    :class="{ 'sm': props.size === 'sm' }"
                    :width="state.iconSize"
                    :height="state.iconSize"
        />
        <div class="contents">
            <p class="plugin-name">
                {{ state.name }} <span v-if="state.isBeta"
                                       class="beta"
                >{{ $t('INVENTORY.COLLECTOR.CREATE.BETA') }}</span>
            </p>
            <div class="plugin-description">
                <span class="plugin-description-text"
                      :class="{ 'sm': props.size === 'sm' }"
                >
                    {{ state.description }}
                </span>
                <p-anchor v-if="state.pluginDetailLink"
                          :href="state.pluginDetailLink"
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
import { useWindowSize } from '@vueuse/core';
import {
    defineProps, reactive, computed,
} from 'vue';

import {
    PAnchor, PLazyImg, PLabel,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { PluginReferenceItem, PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import type { CollectorPluginModel, RepositoryPluginModel } from '@/services/asset-inventory/collector/model';

type Size = 'sm' | 'lg';

// TODO: Add plugin data type
interface Props {
    plugin?: CollectorPluginModel|RepositoryPluginModel|null;
    size?: Size;
}

const { width } = useWindowSize();

const props = withDefaults(defineProps<Props>(), {
    plugin: null,
    size: 'lg',
});

const state = reactive({
    icon: computed<string>(() => state.pluginItem?.icon ?? ''),
    iconSize: computed(() => {
        if (props.size === 'sm' || width.value < 1024) return '2.5rem';
        return '3rem';
    }),
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
        margin-right: 1rem;

        &.sm {
            margin-right: 1.5rem;
        }
    }
    .contents {
        @apply flex flex-col;
        width: 100%;

        .plugin-name {
            @apply text-label-lg text-gray-900;
            margin-bottom: 0.375rem;
            .beta {
                @apply text-label-xs text-coral-500 font-normal;
            }
        }
        .plugin-description {
            @apply inline-flex flex-col gap-1;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            .plugin-description-text {
                @apply text-paragraph-md text-gray-500;

                &.sm {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

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

<template>
    <div class="plugin-data-contents"
         :class="{'align-center': props.alignCenter}"
    >
        <p-lazy-img :src="state.icon"
                    class="plugin-icon"
                    :class="{ 'sm': props.size === 'sm' }"
                    :width="state.iconSize"
                    :height="state.iconSize"
        />
        <div class="contents">
            <p class="plugin-name"
               :class="{emphasize: props.emphasizeName}"
            >
                {{ state.name }} <span :style="{ backgroundColor: repositoryBackgroundColorMap[state.repositoryType], borderRadius: '100%' }"
                                       class="repository-badge-box"
                ><p-i v-if="repositoryIconMap[state.repositoryType]"
                      :name="repositoryIconMap[state.repositoryType]"
                      :color="repositoryColorMap[state.repositoryType]"
                      width="1rem"
                      height="1rem"
                /></span><span v-if="state.isBeta"
                               class="beta"
                >{{ $t('INVENTORY.COLLECTOR.CREATE.BETA') }}</span>
            </p>
            <slot name="contents">
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
                <div v-if="!props.hideLabels"
                     class="label-container"
                >
                    <p-label v-for="(label, idx) in state.labels"
                             :key="`${label}-${idx}`"
                             class="mb-1"
                             :text="label"
                    />
                </div>
            </slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core';
import {
    defineProps, reactive, computed,
} from 'vue';

import {
    PAnchor, PLazyImg, PLabel, PI,
    screens,
} from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { repositoryColorMap, repositoryIconMap, repositoryBackgroundColorMap } from '@/services/asset-inventory/collector/config';
import type {
    RepositoryPluginModel,
} from '@/services/asset-inventory/collector/model';

type Size = 'sm' | 'lg';

interface Props {
    plugin?: RepositoryPluginModel|null;
    size?: Size;
    hideLabels?: boolean;
    emphasizeName?: boolean;
    alignCenter?: boolean;
}

const { width } = useWindowSize();

const props = withDefaults(defineProps<Props>(), {
    plugin: null,
    size: 'lg',
    hideLabels: false,
    emphasizeName: false,
    alignCenter: false,
});

const state = reactive({
    icon: computed<string>(() => assetUrlConverter(props.plugin?.tags?.icon ?? '')),
    iconSize: computed(() => {
        if (props.size === 'sm' || width.value <= screens.tablet.max) return '2.5rem';
        return '3rem';
    }),
    name: computed<string>(() => props.plugin?.name ?? ''),
    description: computed<string>(() => props.plugin?.tags?.description ?? ''),
    labels: computed<string[]>(() => (props.plugin as RepositoryPluginModel)?.labels ?? []), // it is empty with collector plugin
    isBeta: computed<boolean>(() => !!(props.plugin as RepositoryPluginModel)?.tags?.beta ?? false), // it is empty with collector plugin
    pluginDetailLink: computed<string>(() => props.plugin?.tags?.link ?? ''),
    repositoryType: computed<string>(() => props.plugin?.repository_info?.repository_type ?? ''),
});


</script>

<style lang="postcss" scoped>
.plugin-data-contents {
    @apply flex;
    width: 100%;
    &.align-center {
        align-items: center;
    }
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
            @apply text-label-lg text-gray-900 flex items-center gap-1;
            margin-bottom: 0.375rem;
            &.emphasize {
                @apply font-bold;
            }

            .repository-badge-box {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 1.25rem;
                height: 1.25rem;
            }

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

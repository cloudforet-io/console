<template>
    <div class="plugin-data-contents">
        <p-lazy-img :src="props.plugin.icon"
                    class="plugin-icon"
                    width="2.5rem"
                    height="2.5rem"
        />
        <div class="contents">
            <p class="plugin-name">
                {{ props.plugin.name }} <span v-if="isBeta(props.plugin)"
                                              class="beta"
                >{{ $t('beta') }}</span>
            </p>
            <div class="plugin-description">
                <span class="plugin-description-text">
                    {{ props.plugin.tags.description }}
                </span><p-anchor size="sm"
                                 :highlight="true"
                >
                    <!--                    // song-lang-->
                    {{ $t('learn more') }}
                </p-anchor>
            </div>
            <div v-if="props.plugin.labels"
                 class="label-container"
            >
                <p-label v-for="(label, idx) in props.plugin.labels"
                         :key="`${label}-${idx}`"
                         class="mb-1"
                         :text="label"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

import {
    PAnchor, PLazyImg, PLabel,
} from '@spaceone/design-system';
import { get } from 'lodash';

// TODO: Add plugin data type
interface Props {
    plugin: any;
}

const props = defineProps<Props>();

const isBeta = (item) => get(item, 'tags.beta', '');

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

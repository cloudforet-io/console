<template>
    <div v-if="proxyTags.length > 0"
         class="p-query-search-tags"
    >
        <div class="tags-container">
            <div class="left-wrapper">
                <p-button v-if="!readOnly"
                          class="delete-btn"
                          size="sm"
                          style-type="tertiary"
                          @click="deleteAllTags"
                >
                    {{ $t('COMPONENT.QUERY_SEARCH_TAGS.CLEAR_ALL') }}
                </p-button>
            </div>
            <div class="tags-wrapper">
                <p-tag v-for="(tag, idx) in proxyTags"
                       :key="`${idx}-${tag.key ? tag.key.name : tag.value}`"
                       class="tag"
                       :invalid="tag.invalid"
                       :deletable="!readOnly"
                       :outline="true"
                       :selected="!tag.invalid"
                       :error-message="tag.description"
                       @delete="deleteTag(idx)"
                >
                    <template v-if="tag.key">
                        <span class="key-label">
                            {{ tag.key.label || tag.key.name }}
                        </span>
                        <span class="operator">:{{ tag.operator }}</span>
                        <slot :name="`data-type-${tag.key.dataType || 'string'}`"
                              v-bind="{ ...$props, tag }"
                        >
                            <span class="value-label">
                                {{ tag.value.label || tag.value.name }}
                            </span>
                        </slot>
                    </template>
                    <template v-else>
                        {{ tag.value.label || tag.value.name }}
                    </template>
                </p-tag>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref, watch,
} from 'vue';

import PTag from '@/data-display/tags/PTag.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { defaultConverter, defaultValidator } from '@/inputs/search/query-search-tags/helper';
import type {
    QuerySearchTagsFunctions,
    QuerySearchTagsProps,
    QueryTag, QueryTagConverter, QueryTagValidator,
} from '@/inputs/search/query-search-tags/type';
import type { QueryItem } from '@/inputs/search/query-search/type';


export default defineComponent<QuerySearchTagsProps>({
    name: 'PQuerySearchTags',
    components: {
        PButton, PTag,
    },
    props: {
        tags: {
            type: Array as PropType<QueryTag[]>,
            required: true,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        validator: {
            type: Function as PropType<QueryTagValidator|undefined>,
            default: undefined,
        },
        converter: {
            type: Function as PropType<QueryTagConverter|undefined>,
            default: undefined,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const timezone = computed(() => props.timezone);
        const validator = computed<QueryTagValidator>(() => props.validator ?? defaultValidator);
        const converter = computed<QueryTagConverter>(() => props.converter ?? defaultConverter);
        const proxyTags = ref<QueryTag[]>([]);

        const getConvertedQueryTags = (queries: QueryItem[], tags: QueryTag[]): QueryTag[] => queries.reduce((validatedTags, query) => {
            const converted = converter.value(query, timezone.value);
            if (validator.value(converted, validatedTags)) {
                validatedTags.push(converted);
            }
            return validatedTags;
        }, [...tags]);

        const publicFunctions: QuerySearchTagsFunctions = {
            addTag(...queries: QueryItem[]) {
                proxyTags.value = getConvertedQueryTags(queries, proxyTags.value);
                emit('add', proxyTags.value);
            },
            deleteTag(idx: number) {
                proxyTags.value.splice(idx, 1);
                emit('delete', proxyTags.value);
                emit('delete:tag', proxyTags.value);
            },
            deleteAllTags() {
                proxyTags.value = [];
                emit('delete', proxyTags.value);
                emit('delete:all', proxyTags.value);
            },
        };

        const isTagsSame = (tagsA: QueryTag[], tagsB: QueryTag[]) => {
            if (tagsA.length !== tagsB.length) return false;
            return tagsA.map((d) => d.value.name).toString() === tagsB.map((d) => d.value.name).toString();
        };

        watch(() => props.tags, (tags) => {
            if (tags !== proxyTags.value) {
                proxyTags.value = getConvertedQueryTags(tags, []);
            }
        }, { immediate: true });

        watch([() => converter.value, () => validator.value, () => timezone.value], () => {
            proxyTags.value = getConvertedQueryTags(proxyTags.value, []);
        });

        /*
            CAUTION: Do not change it to watch proxyTags.value directly.
            Related Issue: https://github.com/vuejs/core/issues/2116#issuecomment-718667557
         */
        watch(() => [...proxyTags.value], (tags, prevTags) => {
            if (prevTags && !isTagsSame(tags, prevTags)) {
                emit('change', tags);
                emit('update:tags', tags);
            }
        }, { immediate: true });

        return {
            proxyTags,
            ...publicFunctions,
        };
    },
});
</script>

<style lang="postcss">
.p-query-search-tags {
    padding-bottom: 0.37rem;
    > .tags-container {
        @apply flex flex-row w-full;
        max-width: 100%;
        align-items: flex-start;
        > .left-wrapper {
            @apply flex-shrink-0 inline-flex;
            align-items: center;
            > .delete-btn {
                @apply mr-2;
                flex: 0 0 auto;
                font-size: 0.875rem;
            }
        }
        > .tags-wrapper {
            flex-grow: 1;
            overflow-x: hidden;
            display: flex;
            flex-wrap: wrap;
            > .tag {
                min-height: 1.5rem;
                margin-bottom: 0.5rem;
                .text {
                    @apply inline-flex;
                    .alert-icon {
                        cursor: help;
                        margin-right: 0.25rem;
                        flex-shrink: 0;
                    }
                    .key-label {
                        white-space: nowrap;
                        font-weight: bold;
                    }
                    .operator {
                        white-space: nowrap;
                        margin-right: 0.125rem;
                    }
                    .value-label {
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                }
            }
        }
    }
}
</style>

<template>
    <div v-if="_tags.length > 0" class="p-query-search-tags">
        <div class="tags-container">
            <div class="left-wrapper">
                <p-button v-if="!readOnly" class="delete-btn" :outline="true"
                          size="sm" font-weight="normal"
                          style-type="gray-border"
                          @click="deleteAllTags"
                >
                    {{ $t('COMPONENT.QUERY_SEARCH_TAGS.CLEAR_ALL') }}
                </p-button>
            </div>
            <div class="tags-wrapper">
                <p-tag v-for="(tag, idx) in _tags" :key="`${idx}-${tag.key ? tag.key.name : tag.value}`"
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
                        <slot :name="`data-type-${tag.key.dataType || 'string'}`" v-bind="{ ...$props, tag }">
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
import {
    computed, defineComponent, PropType, ref, watch,
} from '@vue/composition-api';

import { VTooltip } from 'v-tooltip';

import PTag from '@/data-display/tags/PTag.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { defaultConverter, defaultValidator } from '@/inputs/search/query-search-tags/helper';
import {
    QuerySearchTagsFunctions,
    QuerySearchTagsProps,
    QueryTag, QueryTagConverter, QueryTagValidator,
} from '@/inputs/search/query-search-tags/type';
import { QueryItem } from '@/inputs/search/query-search/type';
import { i18n } from '@/translations';


export default defineComponent<QuerySearchTagsProps>({
    name: 'PQuerySearchTags',
    directives: { tooltip: VTooltip },
    i18n,
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
        const validator = computed(() => props.validator || defaultValidator);
        const converter = computed(() => props.converter || defaultConverter);

        const getConvertedQueryTags = (queries: QueryItem[], tags: QueryTag[]): QueryTag[] => queries.reduce((validatedTags, query) => {
            const converted = converter.value(query, timezone.value);
            if (validator.value(converted, validatedTags)) {
                validatedTags.push(converted);
            }
            return validatedTags;
        }, [...tags]);

        const _tags = ref<QueryTag[]>(getConvertedQueryTags(props.tags as QueryItem[], []));

        const publicFunctions: QuerySearchTagsFunctions = {
            addTag(...queries: QueryItem[]) {
                _tags.value = getConvertedQueryTags(queries, _tags.value);
                emit('add', _tags.value);
                emit('change', _tags.value);
            },
            deleteTag(idx: number) {
                _tags.value.splice(idx, 1);
                emit('delete', _tags.value);
                emit('delete:tag', _tags.value);
                emit('change', _tags.value);
            },
            deleteAllTags() {
                _tags.value = [];
                emit('delete', _tags.value);
                emit('delete:all', _tags.value);
                emit('change', _tags.value);
            },
        };

        emit('init', {
            tags: _tags.value,
            timezone: timezone.value,
        } as QuerySearchTagsProps);

        watch(() => props.tags, (tags) => {
            _tags.value = getConvertedQueryTags(tags, []);
        });

        return {
            _tags,
            ...publicFunctions,
        };
    },
});
</script>

<style lang="postcss">
.p-query-search-tags {
    padding-bottom: 0.37rem;
    .tags-container {
        @apply flex flex-row w-full;
        max-width: 100%;
        align-items: flex-start;
    }
    .left-wrapper {
        @apply flex-shrink-0 inline-flex;
        align-items: center;
    }
    .delete-btn {
        @apply mr-2;
        flex: 0 0 auto;
        font-size: 0.875rem;
    }
    .tags-wrapper {
        flex-grow: 1;
        overflow-x: hidden;
        display: flex;
        flex-wrap: wrap;
        .tag {
            height: 1.5rem;
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
                    white-space: normal;
                    word-break: break-all;
                }
            }
        }
    }
}
</style>

<template>
    <div v-if="_tags.length > 0" class="p-query-search-tags">
        <div class="tags-container">
            <div class="left-wrapper">
                <span class="filter">{{ $t('COMPONENT.QUERY_SEARCH_TAGS.FILTER') }}: </span>
                <p-badge v-if="!readOnly" class="delete-btn" outline
                         style-type="gray900"
                         @click="deleteAllTags"
                >
                    {{ $t('COMPONENT.QUERY_SEARCH_TAGS.CLEAR_ALL') }}
                </p-badge>
                <div v-if="!readOnly" class="divider" />
            </div>
            <div class="tags-wrapper">
                <p-tag v-for="(tag, idx) in _tags" :key="`${idx}-${tag.key ? tag.key.name : tag.value}`"
                       class="tag"
                       :class="{invalid: tag.invalid}"
                       :deletable="!readOnly"
                       @delete="deleteTag(idx)"
                >
                    <p-i v-if="tag.invalid"
                         v-tooltip.bottom="{content: tag.description, delay: {show: 200}, classes: ['p-tooltip']}"
                         class="alert-icon"
                         name="ic_alert" height="1em" width="1em"
                    />
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
import PTag from '@/data-display/tags/PTag.vue';
import PBadge from '@/data-display/badges/PBadge.vue';
import {
    QuerySearchTagsFunctions,
    QuerySearchTagsProps,
    QueryTag,
} from '@/inputs/search/query-search-tags/type';
import {
    computed, defineComponent, ref, watch,
} from '@vue/composition-api';
import { QueryItem } from '@/inputs/search/query-search/type';
import PI from '@/foundation/icons/PI.vue';
import { VTooltip } from 'v-tooltip';
import { defaultConverter, defaultValidator } from '@/inputs/search/query-search-tags/helper';
import { i18n } from '@/translations';


export default defineComponent({
    name: 'PQuerySearchTags',
    directives: { tooltip: VTooltip },
    i18n,
    components: { PI, PTag, PBadge },
    props: {
        tags: {
            type: Array,
            required: true,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        validator: {
            type: Function,
            default: undefined,
        },
        converter: {
            type: Function,
            default: undefined,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: QuerySearchTagsProps, { emit }) {
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
    .filter {
        @apply mr-4 rounded-sm;
        font-size: 0.75rem;
    }
    .delete-btn {
        flex: 0 0 auto;
        border-radius: 0.125rem;
        padding: 0.125rem 0.5rem;
        height: auto;
        cursor: pointer;
    }
    .divider {
        @apply inline-block my-0 mx-4 text-gray-200;
        height: 1rem;
        border-left-width: 1px;
    }
    .tags-wrapper {
        flex-grow: 1;
        overflow-x: hidden;
        .tag {
            margin-bottom: 0.5rem;
            &.invalid {
                @apply border-alert border bg-white;
            }
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

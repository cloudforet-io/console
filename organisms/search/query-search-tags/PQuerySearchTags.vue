<template>
    <div v-if="_tags.length > 0" class="p-query-search-tags">
        <div class="left">
            <span class="filter">{{ $t('COMPONENT.QUERY_SEARCH_TAGS.FILTER') }}: </span>
            <div v-if="!readOnly" class="delete-btn">
                <p-badge class="tag" outline style-type="gray900"
                         @click="deleteAllTags"
                >
                    {{ $t('COMPONENT.QUERY_SEARCH_TAGS.CLEAR_ALL') }}
                </p-badge>
            </div>
            <div v-if="!readOnly" class="divider" />
        </div>
        <div class="tags">
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
                <span v-if="tag.key">
                    <span class="key-label">
                        {{ tag.key.label || tag.key.name }}
                    </span>
                    :{{ tag.operator }}
                    <slot :name="`data-type-${tag.key.dataType || 'string'}`" v-bind="{ ...$props, tag }">
                        <span class="value-label">{{ tag.value.label || tag.value.name }}</span>
                    </slot>
                </span>
                <template v-else>
                    <span class="value-label">{{ tag.value.label || tag.value.name }}</span>
                </template>
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import PTag from '@/components/molecules/tags/PTag.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import {
    QuerySearchTagsFunctions,
    QuerySearchTagsProps,
    QueryTag,
} from '@/components/organisms/search/query-search-tags/type';
import {
    computed, ref, watch,
} from '@vue/composition-api';
import { QueryItem } from '@/components/organisms/search/query-search/type';
import PI from '@/components/atoms/icons/PI.vue';
import { VTooltip } from 'v-tooltip';
import { defaultConverter, defaultValidator } from '@/components/organisms/search/query-search-tags/helper';


export default {
    name: 'PQuerySearchTags',
    directives: { tooltip: VTooltip },
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
};
</script>

<style lang="postcss">
.p-query-search-tags {
    @apply flex flex-row w-full;
    margin-bottom: 0.37rem;
    .left {
        @apply flex-shrink-0;
        display: flex;
        height: 1.2rem;
        align-items: center;
    }
    .filter {
        @apply mr-4 rounded-sm;
        font-size: 0.75rem;
    }
    .delete-btn {
        @apply flex-shrink-0;
        .tag {
            @apply cursor-pointer rounded-sm flex-grow-0;
        }
    }
    .divider {
        @apply inline-block my-0 mx-4 text-gray-200;
        height: 1rem;
        border-left-width: 1px;
    }
    .tags {
        flex-grow: 1;
        .tag {
            @apply rounded-sm mr-3 mb-3;
            &.invalid {
                @apply border-alert border bg-white;
            }
        }
    }
    .alert-icon {
        @apply mr-1;
        cursor: help;
    }
    .key-label {
        @apply font-bold;
    }
}
</style>

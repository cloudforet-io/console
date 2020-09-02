<template>
    <div v-if="proxyTags.length > 0" class="p-query-search-tags">
        <span class="filter">Filter: </span>
        <div class="delete-btn">
            <p-badge class="tag" outline style-type="gray900"
                     @click="deleteAllTags"
            >
                Clear all
            </p-badge>
        </div>
        <div class="divider" />
        <div class="tags">
            <p-tag v-for="(tag, idx) in proxyTags" :key="`${idx}-${tag.key ? tag.key.name : tag.value}`"
                   class="tag"
                   :class="{invalid: tag.invalid}"
                   @delete="deleteTag(idx)"
            >
                <p-i v-if="tag.invalid"
                     v-tooltip.bottom="{content: tag.description, delay: {show: 200}}"
                     class="alert-icon"
                     name="ic_alert" height="1em" width="1em"
                />
                <span v-if="tag.key">
                    <span class="key-label">{{ tag.key.label || tag.key.name }}</span>
                    :{{ tag.operator }} {{ tag.value.label || tag.value.name }}
                </span>
                <template v-else>
                    {{ tag.value.label || tag.value.name }}
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
    QueryTag, QueryValidator,
} from '@/components/organisms/search/query-search-tags/type';
import {
    computed, reactive, ref, toRefs,
} from '@vue/composition-api';
import { QueryItem } from '@/components/organisms/search/query-search/type';
import { convertQueryItemToQueryTag } from '@/components/organisms/search/query-search-tags/helper';
import PI from '@/components/atoms/icons/PI.vue';
import { VTooltip } from 'v-tooltip';


export default {
    name: 'PQuerySearchTags',
    directives: { tooltip: VTooltip },
    components: { PI, PTag, PBadge },
    props: {
        tags: {
            type: Array,
            required: true,
        },
    },
    setup(props: QuerySearchTagsProps, { emit, listeners }) {
        const _tags = ref<QueryTag[]>(props.tags.map(d => convertQueryItemToQueryTag(d as QueryItem)));
        const state = reactive({
            proxyTags: computed<QueryTag[]>({
                get() {
                    if (listeners['update:tags']) return props.tags;
                    return _tags.value;
                },
                set(val) {
                    _tags.value = val;
                    emit('update:tags', _tags.value);
                },
            }),
        });
        const validation = (query: QueryItem): boolean => state.proxyTags.every((tag) => {
            if (tag.key && query.key) {
                return (query.key.name !== tag.key.name
                        || query.operator !== tag.operator
                        || query.value !== tag.value);
            }
            if (!tag.key && !query.key) {
                return query.value !== tag.value;
            }
            return true;
        });

        const publicFunctions: QuerySearchTagsFunctions = {
            addTag(query: QueryItem, validator?: QueryValidator) {
                console.debug('addTag', query);
                if (validator) {
                    if (!validator(query)) return;
                } else if (!validation(query)) return;
                state.proxyTags = [...state.proxyTags, convertQueryItemToQueryTag(query)];
                emit('add', _tags.value);
                emit('change', _tags.value);
            },
            deleteTag(idx: number) {
                state.proxyTags.splice(idx, 1);
                emit('delete', _tags.value);
                emit('delete:tag', _tags.value);
                emit('change', _tags.value);
            },
            deleteAllTags() {
                state.proxyTags = [];
                emit('delete', _tags.value);
                emit('delete:all', _tags.value);
                emit('change', _tags.value);
            },
        };

        return {
            ...toRefs(state),
            ...publicFunctions,
        };
    },
};
</script>

<style lang="postcss">
.p-query-search-tags {
    @apply flex flex-row w-full;
    margin-bottom: 0.37rem;
    .filter {
        @apply mr-4 rounded-sm;
        font-size: 0.75rem;
        line-height: 1.8;
    }
    .divider {
        @apply inline-block my-0 mx-4 text-gray-200;
        height: 1rem;
        border-left-width: 1px;
        margin-top: 0.22rem;
    }
    .delete-btn {
        .tag {
            @apply cursor-pointer rounded-sm flex-grow-0;
        }
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

<template>
    <div class="p-query-search-tags">
        <span class="filter">Filter: </span>
        <div class="delete-btn">
            <p-badge class="tag" outline style-type="gray900"
                     @click="emitDeleteAllTags"
            >
                Clear all
            </p-badge>
        </div>
        <div class="divider" />
        <div class="tags">
            <p-tag v-for="(tag, idx) in tags" :key="`${idx}-${tag.key ? tag.key.name : tag.value}`" class="tag"
                   @delete="emitDeleteTag(idx)"
            >
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
    QuerySearchTagsProps,
    querySearchTagsProps,
} from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';


export default {
    name: 'PQuerySearchTags',
    components: { PTag, PBadge },
    props: querySearchTagsProps,
    setup(props: QuerySearchTagsProps, { emit }) {
        return {
            emitDeleteTag(...args) { emit('delete:tag', ...args); },
            emitDeleteAllTags(...args) { emit('delete:all', ...args); },
        };
    },
};
</script>

<style lang="postcss" scoped>
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
        }
    }
    .key-label {
        @apply font-bold;
    }
}
</style>

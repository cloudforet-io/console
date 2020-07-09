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
            <p-tag v-for="(tag, idx) in tags" :key="`${idx}-${tag.key ? tag.key.name: tag.value}`" class="tag"
                   @delete="emitDeleteTag(idx)"
            >
                <template v-if="tag.key">
                    <b>{{ tag.key.label }}</b>:{{ tag.operator }} {{ tag.value }}
                </template>
                <template v-else>
                    {{ tag.value }}
                </template>
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import PTag from '@/components/molecules/tags/Tag.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
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
    }
    .divider {
        @apply inline-block my-0 mx-4;
        height: 1.375rem;
        border-left-width: 1px;
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
}
</style>

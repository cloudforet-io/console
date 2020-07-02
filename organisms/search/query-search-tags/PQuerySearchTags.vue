<template>
    <div class="p-query-search-tags">
        <div class="delete-btn">
            <p-icon-button name="ic_delete" @click="emitDeleteAllTags" />
        </div>
        <div class="tags">
            <p-tag v-for="(tag, idx) in tags" :key="`${idx}-${tag.key ? tag.key.name: tag.value}`" class="tag"
                   @delete="emitDeleteTag(idx)"
            >
                <template v-if="tag.key">
                    {{ tag.key.label }}:{{ tag.operator }} {{ tag.value }}
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
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import {
    QuerySearchTagsProps,
    querySearchTagsProps,
} from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';


export default {
    name: 'PQuerySearchTags',
    components: { PTag, PIconButton },
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
    display: flex;
    flex-direction: row;
    width: 100%;
    .delete-btn {
        flex-grow: 0;
    }
    .tags {
        flex-grow: 1;
        margin-left: 1rem;
        .tag {
            margin-top: 0.375rem;
            margin-bottom: 0.37rem;
        }
    }

}
</style>

<template>
    <div class="p-query-search-tags">
        <div class="delete-btn">
            <p-icon-button name="ic_delete" @click="emitDeleteAllTags" />
        </div>
        <div class="tags">
            <p-tag v-for="(tag, idx) in tags" :key="idx + tag.key" class="tag"
                   @delete="emitDeleteTag(idx)"
            >
                {{ tag.key }}:{{ tag.operator }} {{ tag.value }}
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import { makeByPass } from '@/lib/compostion-util';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import PTag from '@/components/molecules/tags/Tag.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';

interface Props {
    tags:SearchQuery[];
}

export default {
    name: 'QuerySearchTags',
    components: { PTag, PIconButton },
    props: {
        tags: {
            type: Array,
            required: true,
        },
    },
    setup(props:Props, { emit }) {
        return {
            emitDeleteTag: makeByPass(emit, 'deleteTag'),
            emitDeleteAllTags: makeByPass(emit, 'deleteAllTags'),
        };
    },
};
</script>

<style lang="scss" scoped>
.p-query-search-tags{
    display: flex;
    flex-direction: row;
    width: 100%;
    .delete-btn{
        flex-grow: 0;
    }
    .tags{
        flex-grow: 1;
        margin-left: 1rem;
        .tag{
            margin-top: 0.375rem;
            margin-bottom: 0.37rem;
        }
    }

}
</style>

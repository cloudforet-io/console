<template>
    <div class="p-tag-input-group">
        <form v-for="(tag,index) in destructTags" :key="index" class="form-inline">
            <p-icon-button v-if="editMode" name="ic_delete" />
            <p-tag-input
                :tag-key="tag.key"
                :tag-value="tag.value"
                @upate:tag-key="updateTag(index,'key',$event )"
                @update:tag-value="updateTag(index, 'value',$event)"
            />
        </form>
        <form class="form-inline">
            <p-icon-button v-if="editMode" name="ic_delete" />
            <p-tag-input tag-key="" />
            <p-icon-button v-if="editMode" name="ic_pluse" />
        </form>
    </div>
</template>

<script>
import _ from 'lodash';
import PTagInput from '@/components/molecules/forms/TagInput';
import PIconButton from '@/components/molecules/buttons/IconButton';

const mergeTags = tags => _.transform(tags, (result, tag) => {
    result[tag.key] = tag.value;
}, {});

const destruct = tags => _.transform(tags, (result, value, key) => {
    result.push({ key, value });
}, []);

export default {
    name: 'PTagInputGroup',
    components: { PTagInput, PIconButton },
    props: {
        editMode: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: Object,
        },

    },
    data() {
        return {
            destructTags: destruct(this.tags),
        };
    },
    // computed: {
    //     get(index, position) {
    //         return this.destructTags[index][position];
    //     },
    //     set() {
    //
    //     },
    // },
    watch: {
        tags() {
            debugger;
            if (this.tags !== mergeTags(this.destructTags)) {
                this.destructTags = destruct(this.tags);
            }
        },
    },
    methods: {
        updateTag(index, position, value) {
            debugger;
            this.destructTags[index][position] = value;
            this.$emit('update:tags', mergeTags(this.destructTags));
        },
    },
    // watch: {
    //     destructTags: {
    //         handler(value) {
    //             console.log(this.beforeTags, value);
    //             if (this.beforeTags !== value) {
    //                 this.$emit('update:tags', mergeTags(value));
    //             }
    //             this.beforeTags = value;
    //         },
    //     },
    //     tags() {
    //         this.destructTags = destruct(this.tags);
    //     },
    // },
};
</script>

<style lang="scss" scoped>
    .p-tag-input-group{
        display: flex;
        flex-wrap:  wrap;

    }
</style>

<template>
    <div class="p-tag-input-group">
        <div v-for="(tag,index) in destructTags" :key="index" class="tag-input-form change-form">
            <p-icon-button v-if="editMode" class="delete-btn" name="ic_delete" />

            <p-tag-input
                :name="tag.key"
                :value="tag.value"
                :disabled="!editMode"
                @update:name="updateTag(index,'key',$event )"
                @update:value="updateTag(index, 'value',$event)"
            />
        </div>
        <div v-if="editMode" class="tag-input-form new-form">
            <p-icon-button
                class="delete-btn"
                name="ic_delete"
                @click="newTagReset"
            />
            <p-tag-input tag-key="" />
            <p-icon-button
                class="add-btn"
                button-style="dark"
                name="ic_pluse"
                @click="newTag"
            />
        </div>
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
    watch: {
        tags() {
            if (this.tags !== mergeTags(this.destructTags)) {
                this.destructTags = destruct(this.tags);
            }
        },
    },
    methods: {
        updateTag(index, position, value) {
            this.destructTags[index][position] = value;
            this.$emit('update:tags', mergeTags(this.destructTags));
        },
        resetNewTag() {

        },
    },
};
</script>

<style lang="scss" scoped>
.p-tag-input-group{
    display: flex;
    flex-wrap:  wrap;
    justify-content: space-between;
}
.form-row.p-tag-input{
    display: inline-flex;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
}
.btn{
    flex: none;
}
.add-btn{
    margin-left: 0.5rem;
}
.p-tag-input{
   flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
}
.new-tag-input-form{
    flex-wrap: nowrap;
    white-space: nowrap;
}
.tag-input-form{
    flex-wrap: nowrap;
    white-space: nowrap;
    flex-shrink: 1;
    margin-bottom: 0.5rem;
    margin-right: 2.5rem;
}
</style>

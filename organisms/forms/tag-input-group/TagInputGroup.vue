<template>
    <div class="p-tag-input-group row col-12">
        <div v-for="(tag,index) in destructTags" :key="index" class="tag-input-form change-form col-md-6 col-sm-12 mr-0">
            <p-icon-button v-if="editMode" class="delete-btn" name="ic_delete"
                           @click="deleteTag(index)"
            />
            <p-tag-input
                :name="tag.name"
                :value="tag.value"
                :disabled="!editMode"
                @update:name="updateTag(index,'name',$event )"
                @update:value="updateTag(index, 'value',$event)"
            />
        </div>

        <div v-if="editMode" class="tag-input-form new-form col-md-6 col-sm-12 mr-0">
            <p-icon-button
                class="delete-btn"
                name="ic_delete"
                @click="resetTag"
            />
            <!--  <div v-show="validatePassWord()" style="display:block" class="invalid-feedback">
                * {{ $t('ORGANISMS.TAG_EMPTY') }}
            </div>-->
            <p-tag-input :name.sync="newTag.name" :value.sync="newTag.value" />
            <p-icon-button
                class="add-btn"
                button-style="dark"
                name="ic_plus"
                color="transparent white"
                @click="addTag"
            />
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import { reactive, ref, watch } from '@vue/composition-api';
import PTagInput from '@/components/molecules/forms/TagInput';
import PIconButton from '@/components/molecules/buttons/IconButton';

const mergeTags = tags => _.transform(tags, (result, tag) => {
    result[tag.name] = tag.value;
}, {});

const destruct = tags => _.transform(tags, (result, value, name) => {
    result.push(({ name, value }));
}, []);

export const useTagsBuffer = (props, context) => {
    const destructTags = ref(destruct(props.tags));
    const state = reactive({
        validatePassWord: false,
    });
    const syncTags = () => {
        context.emit('update:tags', mergeTags(destructTags.value));
        context.emit('TagsChange');
    };
    const updateTag = (index, position, value) => {
        destructTags.value[index][position] = value;
        syncTags();
    };
    const deleteTag = (index) => {
        destructTags.value.splice(index, 1);
        syncTags();
    };
    watch(() => props.tags, (tags) => {
        if (tags !== mergeTags(destructTags.value)) {
            destructTags.value = destruct(tags);
        }
    });
    return {
        destructTags,
        syncTags,
        updateTag,
        deleteTag,
    };
};
export const useNewTag = (props, context, tagsBuffer) => {
    const newTag = reactive({
        name: '',
        value: '',
    });
    const resetTag = () => {
        newTag.name = '';
        newTag.value = '';
    };
    const addTag = (idx) => {
        if (newTag.name) {
            tagsBuffer.destructTags.value.push(reactive({ ...newTag }));
            tagsBuffer.syncTags();
        }
        resetTag();
    };
    return {
        newTag,
        addTag,
        resetTag,
    };
};

export const setup = (props, context) => {
    const tagsBuffer = useTagsBuffer(props, context);
    const newTagState = useNewTag(props, context, tagsBuffer);
    return {
        ...tagsBuffer,
        ...newTagState,
    };
};

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
    setup(...args) {
        return setup(...args);
    },
};
</script>

<style lang="scss" scoped>
.p-tag-input-group{
    display: flex;
    flex-wrap:  wrap;
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
    display: inline-flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    flex-shrink: 1;
    margin-bottom: 0.5rem;
    &:not(.new-form){
        margin-right: 2.5rem;
    }
}
</style>

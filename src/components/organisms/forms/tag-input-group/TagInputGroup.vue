<template>
    <div class="p-tag-input-group row ">
        <div v-for="(tag,index) in destructTags"
             :key="index"
             :class="{'tag-input-form': true, 'mr-0': true, 'col-6': !useFullCol, 'col-12': useFullCol}"
        >
            <p-icon-button v-if="editMode" class="delete-btn" name="ic_delete"
                           @click="deleteTag(index)"
            />
            <div @mouseleave="mouseInOut(index, false)">
                <p-tag-input :name="tag.name"
                             :value="tag.value"
                             :disabled="!editMode"
                             @mouseenter="mouseInOut(index, true)"
                             @update:name="updateTag(index,'name',$event )"
                             @update:value="updateTag(index, 'value',$event)"
                />
                <p-copy-button v-if="getActiveState(index) && !editMode" class="copy-btn" :value="tag.value" />
            </div>
        </div>

        <div v-if="editMode" :class="{'tag-input-form': true, 'mr-0': true, 'col-6': !useFullCol, 'col-12': useFullCol}">
            <!--<p-icon-button
                class="delete-btn"
                name="ic_delete"
                @click="resetTag"
            />-->
            <!--<div v-show="validateTag" style="display:block" class="invalid-feedback">
                 * {{ $t('ORGANISMS.TAG_EMPTY') }}
            </div>-->
            <!-- <p-tag-input :name.sync="newTag.name" :value.sync="newTag.value" />-->
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
import {
    toRefs, reactive, ref, watch, computed,
} from '@vue/composition-api';
import PTagInput from '@/components/molecules/forms/TagInput';
import PIconButton from '@/components/molecules/buttons/IconButton';
import PCopyButton from '@/components/molecules/buttons/CopyButton';

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
    const copyText = (event) => {
        const rawText = event.target.parentElement.innerText;
        const copyLength = this.tr('COMMON.COPY').length;
        const text = rawText.slice(0, -copyLength).trim();
        this.selectToCopyToClipboard(text);
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
        copyText,
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
        // if (newTag.name) {
        tagsBuffer.destructTags.value.push(reactive({ ...newTag }));
        tagsBuffer.syncTags();
        // }
        resetTag();
    };
    return {
        newTag,
        addTag,
        resetTag,
    };
};

const setTagCopy = () => {
    const state = reactive({
        currentIdx: null,
    });

    const mouseInOut = (idx, flag) => {
        if (flag) {
            state.currentIdx = idx;
        } else {
            state.currentIdx = null;
        }
    };

    const getActiveState = idx => state.currentIdx === idx;

    return {
        ...toRefs(state),
        mouseInOut,
        getActiveState,
    };
};

export const setup = (props, context) => {
    const tagsBuffer = useTagsBuffer(props, context);
    const newTagState = useNewTag(props, context, tagsBuffer);
    const tagCopyState = setTagCopy();

    return {
        ...tagsBuffer,
        ...newTagState,
        ...tagCopyState,
    };
};

export default {
    name: 'PTagInputGroup',
    components: { PTagInput, PIconButton, PCopyButton },
    props: {
        editMode: {
            type: Boolean,
            default: false,
        },
        useFullCol: {
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
    .copy-btn::v-deep{
        .p-copy-btn{top:-.3rem;
            margin-bottom: 8px;
        }
    }
</style>

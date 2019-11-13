<template>
    <p-panel-top panel-title="Tags" class="tag-panel-title">
        <template #head>
            <div class="panel-header" :class="{'edit':editMode}">
                <p-button v-if="!editMode" style-type="primary" class="header-btn"
                          @click="clickEdit()"
                >
                    <p-i icon=""></p-i> edit
                </p-button>
                <p-button v-if="editMode" style-type="secondary" :outline="true"
                          class="header-btn"
                          @click="clickCancel()"
                >
                    Cancel
                </p-button>
                <p-button v-if="editMode" style-type="secondary" class="header-btn"
                          @click="clickConfirm()"
                >
                    Confirm
                </p-button>
            </div>
        </template>
        <template #body>
            <p-tag-input-group ref="tagInputGroup" :tags.sync="proxyTags" :edit-mode="editMode" />
        </template>
    </p-panel-top>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import PTagInputGroup from '@/components/organisms/forms/tag-input-group/TagInputGroup';
import PButton from '@/components/atoms/buttons/Button';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'PTagPanel',
    components: {
        PPanelTop,
        PTagInputGroup,
        PButton,
    },
    events: ['confirm'],
    props: {
        tags: Object,
    },
    setup(props, context) {
        const state = reactive({
            editMode: false,
            originTags: undefined,
            proxyTags: makeProxy('tags', props, context.emit),
            tagInputGroup: null, // template refs
        });

        const clickEdit = () => {
            state.editMode = true;
            state.originTags = {
                ...props.tags,
            };
        };
        const clickCancel = () => {
            state.editMode = false;
            state.proxyTags = {
                ...state.originTags,
            };
            state.tagInputGroup.resetTag();
        };
        const clickConfirm = () => {
            state.editMode = false;
            if (JSON.stringify(state.originTags) !== JSON.stringify(state.proxyTags)) {
                context.emit('confirm', state.proxyTags);
            }
            state.tagInputGroup.resetTag();
        };
        const resetTag = () => {
            state.proxyTags = state.originTags;
        };
        return {
            ...toRefs(state),
            clickEdit,
            clickCancel,
            clickConfirm,
            // if tag confirm fail, you can reset tags to before edit value
            resetTag,
        };
    },

};
</script>

<style lang="scss" scoped>
   .panel-header{
       display: inline-flex;
        width: 100%;

       &.edit{
        justify-content: flex-end;
       }
       .header-btn{
           margin-left: 1rem;
       }
   }
</style>

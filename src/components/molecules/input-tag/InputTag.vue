<template>
    <div class="row col-12">
        <vue-tags-input :value="tagText"
                        :style="responsiveStyle"
                        :placeholder="getPlaceHolder"
                        :tags="getTags"
                        @input="$emit('update:tagText',$event)"
                        @tags-changed="newTags => getTags = newTags"
        />
    </div>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input';
import _ from 'lodash';

export default {
    name: 'PInputTag',
    components: {
        VueTagsInput,
    },
    props: {
        tagPlaceHolder: {
            type: String,
            default: 'This is Sparta',
        },
        responsiveStyle: {
            type: Object,
            default: null,
        },
        tagText: {
            type: String,
        },
        tagArray: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
        };
    },
    computed: {
        getPlaceHolder() {
            return this.tagPlaceHolder;
        },
        getTags: {
            get() {
                console.log('tagArray', this.newVal);
                return this.tagArray;
            },
            set(value) {
                this.$emit('update:tagArray', value);
            },
        },
    },
    method: {

    },
};
</script>
//  background: #F8F8FC 0% 0% no-repeat padding-box;
<style lang="scss">

    .vue-tags-input {
        min-width: 100%;
        border: 1px solid $gray3;
    }

    .vue-tags-input .ti-tag {
        min-width: 2.5rem;
        position: relative;
        background: $gray2 0% 0% no-repeat padding-box;
        border-radius: 100px;
        color: $dark;
        text-align: left;
        font: 12px/14px Arial;
    }

    .vue-tags-input .ti-tag .ti-content {
        margin-left: 0.5rem;
    }

    .vue-tags-input .ti-tag .ti-actions {
        margin-left: 16px;
        display: flex;
        font-size: 1.15em;
        background: $gray2 0% 0% no-repeat padding-box;
        color: $gray1;
        opacity: 1;
    }

    .vue-tags-input .ti-new-tag-input-wrapper {
        background-color: $primary4;
         > input{
             background-color: $primary4;
         }
    }

    .vue-tags-input .ti-input {
        border: none;
        display: flex;
        padding: 4px;
        background: $primary4 0% 0% no-repeat padding-box;
        flex-wrap: wrap;
    }

</style>

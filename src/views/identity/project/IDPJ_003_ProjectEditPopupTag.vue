<template>
  <b-form-group label="Tags" :label-cols="3" :horizontal="true">
    <BaseTag
      :tag-data="tags"
      :editable="true"
    />
  </b-form-group>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag';

export default {
    name: 'ProjectEditPopUpTag',
    components: {
        BaseTag
    },
    props: {

    },
    data () {
        return {
            selectedTag: []
        };
    },
    computed: {
        tags () {

            console.log('this.selectedTags', this.selectedTag);
            return this.dictToKeyValueArray(this.selectedTag);
        }
    },
    created (){
        this.onCreate();
    },
    methods: {
        async onCreate () {
            const selected = this.$attrs['selected-data'].tree.getSelected()[0];
            const url = selected.data.item_type === 'PROJECT_GROUP' ? '/identity/project-group/get' : '/identity/project/get';
            let param = selected.data.item_type === 'PROJECT_GROUP' ? { project_group_id: selected.data.id } : { project_id:selected.data.id };

            await this.$axios.post(url, param).then((response) => {
                const selectedTags = response.data.tags;
                this.selectedTag = selectedTags;
                console.log('this.selectedTags', this.selectedTag);
            }).catch((error) => {
                console.error(error);
            });

        }
    }
};
</script>

<style lang="scss" scoped>

</style>

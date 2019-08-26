<template>
  <div class="animated fadeIn">
    <div class="row">
      <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
        <b-card class="base">
          <b-form-group label="Tags" :label-cols="3" :horizontal="true" class="ml-3 mt-4">
            <BaseTag ref="projectTag"
                     :tag-data="tags"
                     :editable="true"

            />
          </b-form-group>
        </b-card>
      </b-col>
    </div>
  </div>
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
            return this.dictToKeyValueArray(this.selectedTag);
        }
    },
    created (){
        if (this.$attrs['is-updatable']){
            this.onCreate();
        }
    },
    methods: {
        async onCreate () {
            const selected = this.$attrs['selected-data'].tree.getSelected()[0];
            if (this.isEmpty(this._.get(selected,'data.init'))) {
                const url = selected.data.item_type === 'PROJECT_GROUP' ? '/identity/project-group/get' : '/identity/project/get';
                let param = selected.data.item_type === 'PROJECT_GROUP' ? { project_group_id: selected.data.id } : { project_id:selected.data.id };
                await this.$axios.post(url, param).then((response) => {
                    const selectedTags = response.data.tags;
                    if (!this.isEmpty(selectedTags)){
                        this.selectedTag = selectedTags;
                        console.log('this.selectedTags', this.selectedTag);
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>

</style>

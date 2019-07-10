<template>
    <b-form @reset.prevent="onReset" @submit.prevent="updatable && creatable ? onCreate() : onUpdate()">
      <b-form-group label="Tags" :label-cols="3" :horizontal="true">
        <BaseTag :updatable="updatable" :tags-prop="updatable ? updatableTags : tags" />
      </b-form-group>
    </b-form>
</template>

<script>
  import BaseTag from '@/component/base/tag/BATG_001_BaseTag'
  import {api} from '@/setup/api'

  const projectModel = {
    name: null,
    parent_project_group_id: null,
    template_id: null,
    domain_id: null,
    user_id: null,
    tags: []
  };

  export default {
    name: 'ProjectEditPopUpTag',
    components: {
      BaseTag
    },
    data() {
      return {
        name: this.projectProp.name,
        parent_project_group_id: this.projectProp.parent_project_group_id, // required
        template_id: this.projectProp.template_id,
        domain_id: this.projectProp.domain_id,
        user_id: this.projectProp.user_id,
        updatableTags: this.updatable ? this.projectProp.tags.slice(0) : []
      }
    },
    props:{
      projectProp: {
        type: Object,
        default: () => (projectModel)
      },
      creatable: {
        type: Boolean,
        default: false
      },
      updatable: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      tags () {
        return this.updatable ? this.updatableTags : this.projectProp.tags
      }
    },
    watch: {
      userProp (updatedUser) {
        this.resetUserData(updatedUser)
      }
    },
    methods: {
      onReset () {
        if (this.creatable) this.resetProjectData(projectModel)
        else this.resetProjectData(this.projectProp)
      },
      resetProjectData (project) {
        this.updatableTags = project.tags.slice(0)
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>

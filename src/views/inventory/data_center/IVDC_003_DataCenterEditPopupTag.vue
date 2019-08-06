<template>
  <b-form @reset.prevent="onReset"
          @submit.prevent="updatable && creatable ? onCreate() : onUpdate()"
  >
    <b-form-group label="Tags" :label-cols="3" :horizontal="true">
      <BaseTag
        :updatable="updatable"
        :show-first-tag-row="true"
        :tags-prop="updatable ? updatableTags : tags"
      />
    </b-form-group>
  </b-form>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag';
import { api } from '@/setup/api';

const dataCenterModel = {
    name: null,
    parent_dataCenter_group_id: null,
    template_id: null,
    domain_id: null,
    user_id: null,
    tags: []
};

export default {
    name: 'DataCenterEditPopUpTag',
    components: {
        BaseTag
    },
    props: {
        dataCenterProp: {
            type: Object,
            default: () => (dataCenterModel)
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
    data () {
        return {
            name: this.dataCenterProp.name,
            parent_dataCenter_group_id: this.dataCenterProp.parent_dataCenter_group_id, // required
            template_id: this.dataCenterProp.template_id,
            domain_id: this.dataCenterProp.domain_id,
            user_id: this.dataCenterProp.user_id,
            updatableTags: this.updatable ? this.dataCenterProp.tags.slice(0) : []
        };
    },
    computed: {
        tags () {
            return this.updatable ? this.updatableTags : this.dataCenterProp.tags;
        }
    },
    watch: {
        userProp (updatedUser) {
            this.resetUserData(updatedUser);
        }
    },
    methods: {
        onReset () {
            if (this.creatable) {
                this.resetDataCenterData(dataCenterModel);
            } else {
                this.resetDataCenterData(this.dataCenterProp);
            }
        },
        resetDataCenterData (dataCenter) {
            this.updatableTags = dataCenter.tags.slice(0);
        }
    }
};
</script>

<style lang="scss" scoped>

</style>

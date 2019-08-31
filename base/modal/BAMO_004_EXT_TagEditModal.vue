<template>
  <div>
    <BaseModal ref="BAMO004_TagEditModal" 
               :title="title"
               centered
               size="md"
               type="primary"
               interactive
               @ok="onEditTags"
    >
      <template #contents>
        <BaseTag ref="BAMO004_Tags" 
                 :tag-data="tags" 
                 editable
                 align="between"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseTag = () => import('@/components/base/tags/BATG_001_BaseTag');
export default {
    name: 'TagEditModal',
    components: {
        BaseModal,
        BaseTag
    },
    props: {
        title: {
            type: String,
            default: null
        },
        tags: {
            type: Array,
            default: () => []
        }
    },
    created () {
        if (this.isEmpty(this.title)) {
            this.tr('TITLE', [this.tr('BTN_EDIT'), this.tr('TAG')]);
        }
    },
    methods: {
        async onEditTags () {
            // if (this.$refs.BAMO004_Tags.validate()) {
            //     let res = null;
            //     try {
            //         res = await this.$axios.post('/identity/user/update', {
            //             user_id: this.userData.user_id,
            //             tags: this.$refs.BAMO004_Tags.tags
            //         });
            //         this.hideTagEditModal();
            //         this.$emit('update', res.data);
            //     } catch (e) {
            //         console.error(e);
            //     }
            // }
        },
        showModal () {
            this.$refs.BAMO004_TagEditModal.showModal();
        },
        hideModal () {
            this.$refs.BAMO004_TagEditModal.hideModal();
        }
    }
};
</script>

<style lang="scss" scoped>

</style>
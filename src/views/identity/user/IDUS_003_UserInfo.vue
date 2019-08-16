<template>
  <div>
    <BasePanel class="panel" 
               :panels="selectedUserData"
               @edit="$refs.tagEditModal.showModal()"
    />
    <BaseModal ref="tagEditModal" 
               title="Edit Tags"
               :centered="true"
               size="md"
               type="primary"
               :interactive="true"
               @ok="onEditTags"
    >
      <template #contents>
        <BaseTag ref="baseTag" 
                 :tag-data="tags" 
                 :editable="true"
                 align="between"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseTag = () => import('@/components/base/tags/BATG_001_BaseTag');
const userModel = {
    user_id: null,
    name: null,
    password: null,
    email: null,
    mobile: null,
    group: null,
    domain_id: null,
    language: null,
    timezone: null,
    tags: []
};

export default {
    name: 'UserInfo',
    components: {
        BasePanel,
        BaseModal,
        BaseTag
    },
    props: {
        userProp: {
            type: Object,
            default: () => (userModel),
            required: true
        }
    },
    computed: {
        selectedUserData () {
            return [
                { 
                    panelTitle: 'Base Information',
                    panelIcon: {
                        icon: 'fa-hashtag',
                        type: 'l',
                        size: 1,
                        color: 'primary'
                    },
                    data: [
                        { title: 'ID', contents: this.userProp.user_id, copyFlag: true },
                        { title: 'Name', contents: this.userProp.name, copyFlag: true },
                        { title: 'Email', contents: this.userProp.email, copyFlag: true },
                        { title: 'Phone', contents: this.userProp.mobile, copyFlag: true },
                        { title: 'Group Name', contents: this.userProp.group, copyFlag: true },
                        { title: 'Language', contents: this.userProp.language, copyFlag: true },
                        { title: 'Domain ID', contents: this.userProp.domain_id, copyFlag: true }
                    ]
                },
                {
                    panelTitle: 'Tag',
                    panelIcon: {
                        icon: 'fa-tags',
                        type: 'l',
                        size: 1,
                        color: 'danger'
                    },
                    data: this.tagData,
                    editable: true
                }
            ];
        },
        tagData () {
            let tagData = [];
            for (var key in this.userProp.tags) {
                tagData.push({ 
                    title: key, 
                    contents: this.userProp.tags[key],
                    copyFlag: true 
                });
            }
            return tagData;
        },
        tags () {
            return this.dictToKeyValueArray(this.userProp.tags);
        }
    },
    methods: {
        async onEditTags () {
            if (this.$refs.baseTag.validate()) {
                let res = null;
                try {
                    res = await this.$axios.post('/identity/user/update', {
                        user_id: this.userProp.user_id,
                        tags: this.$refs.baseTag.tags
                    });
                    this.$refs.tagEditModal.hideModal();
                    this.$emit('update', res.data);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>

</style>
<template>
  <BasePanel class="panel" :panels="selectedUserData" />
</template>

<script>
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');
const userModel = {
    userId: null,
    name: null,
    password: null,
    email: null,
    mobile: null,
    group: null,
    domainId: null,
    language: null,
    timezone: null,
    tags: []
};

export default {
    name: 'UserInfo',
    components: {
        BasePanel
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
                        { title: 'ID', contents: this.userProp.userId },
                        { title: 'Name', contents: this.userProp.name },
                        { title: 'Email', contents: this.userProp.email },
                        { title: 'Phone', contents: this.userProp.mobile },
                        { title: 'Group Name', contents: this.userProp.group },
                        { title: 'Language', contents: this.userProp.language },
                        { title: 'Domain ID', contents: this.userProp.domainId }
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
                    data: this.userProp.tags.map((tag) => {
                        return {
                            title: Object.keys(tag)[0],
                            contents: Object.values(tag)[0]
                        };
                    })
                }
            ];
        }
    },
    created() {
    }
};
</script>

<style lang="scss" scoped>

</style>
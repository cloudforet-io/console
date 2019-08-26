<template>
  <BaseMultiPanel :data="users" :data-fields="fields" />
</template>

<script>
import BaseMultiPanel from '@/components/base/panel/BAPA_005_BaseMultiPanel';

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
    name: 'MultiUsersInfo',
    components: {
        BaseMultiPanel
    },
    props: {
        usersData: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
        };
    },
    computed: {
        users () {
            return this.usersData;
        },
        fields () {
            return [
                { key: 'user_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') },
                { key: 'group', label: this.tr('COL_NM.GROUP') }
            ];
        }
    },
    methods: {
        copyAllToClipboard (key) {
            let result = '';
            this.usersData.map((user) => {
                result += ` ${user[key]}`;
            });
            this.selectToCopyToClipboard(result);
        }
    }
};
</script>

<style lang="scss" scoped>
.copy-clipboard {
    vertical-align: baseline;
}
</style>
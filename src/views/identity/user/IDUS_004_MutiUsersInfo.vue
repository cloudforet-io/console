<template>
  <div>
    <BaseTable class="user-table" 
               :table-data="users" 
               :fields="fields" 
               :selectable="false"
               cardless
               headerless
               underlined
    >
      <template v-for="field in fields" 
                :slot="`HEAD_${field.key}`"
      >
        <span :key="field.key" class="copy-clipboard">
          <span class="contents">
            {{ field.label }}
          </span>
          <i v-b-tooltip.hover.right
             class="fal fa-copy"
             :title="`Copy all ${field.label}s`"
             @click="CopyToClipboard(field.key)"
          />
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';

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
        BaseTable
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
        CopyToClipboard (key) {
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
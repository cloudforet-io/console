<template>
  <div>
    <BaseTable :table-data="users" 
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
             @click="copyAllToClipboard(field.key)"
          />
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BaseTable';

export default {
    name: 'BaseMutiPanel',
    components: {
        BaseTable
    },
    props: {
        data: {
            type: Array,
            default: () => []
        },
        dataFields: {
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
            return this.data;
        },
        fields () {
            return this.dataFields;
        }
    },
    methods: {
        copyAllToClipboard (key) {
            let result = '';
            this.data.map((item) => {
                result += ` ${item[key]}`;
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
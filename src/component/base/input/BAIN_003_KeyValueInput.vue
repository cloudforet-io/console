<template>
  <b-row align-v="center" align-h="between" no-gutters class="mb-2">
    <b-col v-if="!readOnly" cols="1">
      <span class="delete-btn" @click="$emit('delete')">
        <i class="fa fa-minus-square" />
      </span>
    </b-col>
    <b-col cols="11" class="row">
      <b-col cols="5">
        <b-input v-model="key" :plaintext="readOnly" type="text" placeholder="Key"
                 :class="{'text-right': !readOnly}"
        />
      </b-col>
      <b-col cols="1">
        <div class="colon text-center">
          :
        </div>
      </b-col>
      <b-col cols="5">
        <b-input v-model="value" :plaintext="readOnly" type="text" placeholder="Value" />
      </b-col>
    </b-col>
  </b-row>

  <!-- <b-row v-else>
    <b-col>
      <span>
        {{ key }} : {{ value }}
      </span>
    </b-col>
  </b-row> -->
</template>

<script>
export default {
  name: 'KeyValueInput',
  event: ['delete'],
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      key: Object.keys(this.data)[0] || '',
      value: Object.values(this.data)[0] || ''
    };
  },
  methods: {
    /**
     * TODO: validation
     */
  }
};
</script>

<style lang="scss" scoped>
.delete-btn {
  i {
    font-size: 1.3em;
    vertical-align: text-top;
  }
  cursor: pointer;
  color: #e81d2a;
}
.colon {
  display: block;
  padding: 5px;
}
</style>

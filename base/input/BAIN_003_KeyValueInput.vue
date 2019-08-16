<template>
  <b-row :align-h="align" no-gutters>
    <div v-if="!readOnly" 
         class="delete-btn" 
         @click="$emit('delete')"
    >
      <span class="icon"><i class="fal fa-minus-circle" /></span>
    </div>
    <b-col cols="5">
      <b-form-group>
        <b-form-input v-model="key"
                      :plaintext="readOnly"
                      type="text"
                      placeholder="Key"
                      :class="{'text-right': !readOnly}"
                      :state="validateKey"
                      @input="keyChanged"
        />
        <b-form-invalid-feedback v-if="!readOnly" :state="validateKey">
          <div v-if="!validateKeyNull">
            This is a mendatory field.
          </div>
          <div v-else-if="!validateKeyUnique">
            Key must be unique.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>
    </b-col>
    <div class="colon text-center">
      <span>:</span>
    </div>
    <b-col cols="5">
      <b-form-group>
        <b-form-input v-model="value" 
                      :plaintext="readOnly" 
                      type="text" 
                      placeholder="Value"
                      :state="validateValue"
        />
        <b-form-invalid-feedback v-if="!readOnly" :state="validateValue">
          This is a mendatory field.
        </b-form-invalid-feedback>
      </b-form-group>
    </b-col>
  </b-row>
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
        },
        align: {
            type: String,
            default: 'start'
        }
    },
    data () {
        return {
            key: Object.keys(this.data)[0] || null,
            value: Object.values(this.data)[0] || null,
            noValidate: true,
            duplicatedKey: null
        };
    },
    computed: {
        validateKeyNull() {
            return !this.isEmpty(this.key);
        },
        validateKeyUnique() {
            return !this.duplicatedKey;
        },
        validateKey() {
            if (this.noValidate) { 
                return null; 
            }
            if (this.validateKeyNull) {
                return this.validateKeyUnique;
            }
            return this.validateKeyNull;
        },
        validateValue() {
            if (this.noValidate) { 
                return null; 
            }
            return !this.isEmpty(this.value);
        }
    },
    methods: {
        isNotNull() {
            this.noValidate = false;
            return !!(this.validateKeyNull && this.validateValue);
        },
        setDuplicated() {
            this.duplicatedKey = true;
        },
        keyChanged() {
            this.duplicatedKey = null;
        }
    }
};
</script>

<style lang="scss" scoped>
.delete-btn {
    cursor: pointer;
    color: $red;
    margin-right: 10px;
    .icon {
        font-size: 1.3em;
        vertical-align: text-top;
    }
}
.colon {
  display: block;
  padding: 5px;
  margin: 0 8px;
}
.form-control {
    height: 1.8rem;
    line-height: 1.8rem;
}
</style>

<template>
  <fieldset class="form-group">
    <b-row class="form-row">
      <legend v-if="!isEmpty(label)" class="col-form-label text-right"
              :class="`col-${labelCols} ${labelClass}`"
      >
        <span v-if="required" class="required">*</span> 
        {{ label }}
      </legend>
      <b-input-group class="col-9">
        <b-form-input :value="input"
                      :type="type" 
                      :plaintext="plaintext" 
                      :state="state"
                      :placeholder="placeholder"
                      :required="browserRequired"
                      :autocomplete="autocomplete"
                      @input="onInput"
        />
        <b-input-group-append v-if="$scopedSlots.append">
          <slot name="append" />
        </b-input-group-append>
      </b-input-group>
    </b-row>
    <b-row align-h="end" class="form-row">
      <b-col cols="9">
        <b-form-invalid-feedback :state="state">
          {{ invalidMessage }}
        </b-form-invalid-feedback>
        <b-form-valid-feedback :state="state">
          {{ validMessage }}
        </b-form-valid-feedback>
        <small v-if="state === null"
               tabindex="-1" class="form-text text-muted"
        >
          {{ description }}
        </small>
      </b-col>
    </b-row>
  </fieldset>
</template>

<script>
export default {
    name: 'BaseField',
    model: {
        prop: 'input',
        event: 'input'
    },
    props: {
        input: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: 'text'
        },
        plaintext: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        autocomplete: {
            type: String,
            default: 'off'
        },
        label: {
            type: String,
            default: ''
        },
        labelCols: {
            type: [String, Number],
            default: '12'
        },
        labelClass: {
            type: String,
            default: ''
        },
        required: {
            type: Boolean,
            default: false
        },
        browserRequired: {
            type: Boolean,
            default: false
        },
        state: {
            type: Boolean,
            default: null
        },
        validMessage: {
            type: String,
            default: ''
        },
        invalidMessage: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        }
    },
    methods: {
        onInput (val, e) {
            this.$emit('input', val, e);
        }
    }
};
</script>

<style lang="scss" scoped>
.input-group {
    .form-control {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .input-group-append {
        .btn {
            border-radius:  0 5px 5px 0;
            border: 1px solid darken($lightgray, 5%);
        }
    }
}
.required {
    color: $violet;
}
</style>
<template>
    <fieldset class="form-group">
        <b-row class="form-row">
            <legend v-if="!isEmpty(label)" class="col-form-label text-right"
                    :class="`col-${labelCols} ${labelClass}`"
            >
                <span v-if="!plaintext && required" class="required">*</span>
                {{ label }}
            </legend>
            <b-input-group :class="`col-${fieldCols ? fieldCols : 12 - labelCols}
                     ${fieldClass}`"
            >
                <b-form-input v-if="type !== 'select'"
                              :class="{append: $scopedSlots.append}"
                              :value="value"
                              :type="type"
                              :plaintext="plaintext"
                              :state="state"
                              :placeholder="placeholder"
                              :required="browserRequired"
                              :autocomplete="autocomplete"
                              :tabindex="tabindex"
                              @input="onInput"
                />
                <ModelSelect v-else
                             :value="value"
                             :options="options"
                             :placeholder="placeholder"
                             @input="onSelect"
                />
                <b-input-group-append v-if="$scopedSlots.append">
                    <slot name="append" />
                </b-input-group-append>
            </b-input-group>
        </b-row>
        <b-row v-if="!plaintext" align-h="end" class="form-row">
            <b-col :class="`col-${fieldCols ? fieldCols : 12 - labelCols} ${fieldClass}`">
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
import { ModelSelect } from 'vue-search-select';

export default {
    name: 'BaseField',
    events: ['input'],
    components: {
        ModelSelect,
    },
    model: {
        prop: 'value',
        event: 'input',
    },
    props: {
        value: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            default: 'text',
        },
        plaintext: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '',
        },
        autocomplete: {
            type: String,
            default: 'off',
        },
        tabindex: {
            type: String,
            default: '0',
        },
        label: {
            type: String,
            default: '',
        },
        labelCols: {
            type: Number,
            default: 3,
        },
        labelClass: {
            type: String,
            default: '',
        },
        fieldCols: {
            type: Number,
            default: 0,
        },
        fieldClass: {
            type: String,
            default: '',
        },
        options: {
            type: [Array, Object],
            default: () => [],
        },
        required: {
            type: Boolean,
            default: false,
        },
        browserRequired: {
            type: Boolean,
            default: false,
        },
        state: {
            type: Boolean,
            default: null,
        },
        validMessage: {
            type: String,
            default: '',
        },
        invalidMessage: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
    },
    methods: {
        onInput(val, e) {
            this.$emit('input', val, e);
        },
        onSelect(val) {
            this.$emit('input', val);
        },
    },
};
</script>

<style lang="scss" scoped>
.form-row {
      align-items: center;
      legend.col-form-label {
            word-break: break-word;
      }
}
.input-group.append {
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

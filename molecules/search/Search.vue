<template>
    <div class="row" style="width:100%">
        <div :class="getColSizer">
            <p-input-text class="form-control py-2 border-right-0 border"
                          :value="searchText"
                          :disabled="disabled"
                          :placeholder="searchPlaceholder"
                          @input="$emit('update:searchText',$event)"
                          @keyup.enter="onSearch"
            />
            <slot name="input-text" />
            <div>
                <p-button class="search-btn" @click="onSearch">
                    <p-i :color="'transparent inherit'"
                         :width="'1.3rem'"
                         :height="'1.3rem'"
                         :name="'ic_search'"
                    />
                </p-button>
            </div>
            <slot name="input-button" />
        </div>
    </div>
</template>
<script>
import PInputText from '@/components/atoms/inputs/TextInput';
import PI from '@/components/atoms/icons/PI';
import PButton from '@/components/atoms/buttons/Button';

export default {
    name: 'PSearch',
    events: ['onSearch'],
    components: {
        PButton,
        PInputText,
        PI,
    },
    props: {
        size: {
            type: Number,
            default: 12,
        },
        searchText: {
            type: String,
        },
        searchPlaceholder: {
            type: String,
            default: 'Please, Place any String',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        getColSizer() {
            return `input-group col-${this.size}`;
        },
    },
    methods: {
        onSearch() {
            this.$emit('onSearch', this.searchText);
        },
    },
};
</script>

<style lang="scss" scoped>
    .row {
        margin: 0;
        .input-group {
            padding: 0;
        }
    }
    .form-control{
        height: 2rem !important;
    }
    .search-btn {
        min-width: 32px;
        background-color: white;
        border-radius: 0px 2px 2px 0px;
        border-top: 1px solid $gray2;
        border-right: 1px solid $gray2;
        border-bottom: 1px solid $gray2;
    }

    .form-control:focus {
        outline: 0 !important;
        border-color: initial;
        box-shadow: none;
    }
    .search-btn:hover {
      border-color: $primary;
      background-color: $primary;
      color: white;
    }
</style>

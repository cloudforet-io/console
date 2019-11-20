<template>
    <div class="row" style="width:100%">
        <div :class="getColsizer" >
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
    components: {
        PButton,
        PInputText,
        PI,
    },
    computed: {
        getColsizer() {
            return 'input-group col-' + this.size;
        },
    },
    props: {
        size:{
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
    methods: {
        onSearch() {
            this.$emit('onSearch', this.searchText);
        },
    },
};
</script>

<style lang="scss" scoped>
    .search-btn {
        min-width: 32px;
        background-color: white;
        height: 35px;
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

<template>
    <div class="row" style="width:100%">
        <div class="input-group" :class="getColSizer">
            <p-input-text v-focus.lazy="proxyFocused"
                          class="form-control py-2 border-right-0 border"
                          :value="searchText"
                          :disabled="disabled"
                          :placeholder="searchPlaceholder"
                          @input="$emit('update:searchText',$event)"
                          @keyup.enter="onSearch"
                          @focus="proxyFocused = true"
                          @blur="proxyFocused = false"
            />
            <slot name="input-text" />
            <div>
                <p-button class="search-btn" @click="onSearch">
                    <p-i color="transparent inherit"
                         width="1.3rem"
                         height="1.3rem"
                         name="ic_search"
                    />
                </p-button>
            </div>
            <slot name="input-button" />
        </div>
    </div>
</template>
<script>
import { focus } from 'vue-focus';
import { computed } from '@vue/composition-api';
import PInputText from '@/components/atoms/inputs/TextInput.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'PSearch',
    events: ['onSearch'],
    directives: { focus },
    components: {
        PButton,
        PInputText,
        PI,
    },
    props: {
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
        focused: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        // todo: col를 외부에서 정의하도록 하기 (row,col 제거)
        const getColSizer = computed(() => `col-${props.size}`);
        const proxyFocused = makeProxy('focused', props, context.emit);
        return {
            onSearch() {
                context.emit('onSearch', props.searchText);
            },
            proxyFocused,
            getColSizer,
        };
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

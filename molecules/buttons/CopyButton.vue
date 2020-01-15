<template>
    <span class="copy-btn-container">
        <p-button
            class="p-copy-btn"
            outline
            style-type="secondary"
            size="sm"
            @click="copyText"
        >
            {{ tr('COMMON.COPY') }}
        </p-button>
    </span>
</template>

<script>
import _ from 'lodash';
import PButton from '@/components/atoms/buttons/Button.vue';
import { selectToCopyToClipboard } from '@/lib/util';

export default {
    name: 'PCopyButton',
    components: { PButton },
    props: {
        value: {
            type: [String, Array, Number, Object, Boolean],
            default: '',
        },
    },
    methods: {
        copyText() {
            if (this.value instanceof Array) {
                selectToCopyToClipboard(_.toString(this.value));
            } else if (typeof this.value === 'object') {
                selectToCopyToClipboard(JSON.stringify(this.value));
            } else selectToCopyToClipboard(this.value || '');
        },
    },
};
</script>

<style lang="scss" scoped>
    .copy-btn-container {
        position: relative;
        min-width: 55px;
    }
    .p-copy-btn {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0.75rem;
        padding: .3rem .75rem;
        font-size: .75rem;
        line-height: .875rem;
        vertical-align: middle;
    }
</style>

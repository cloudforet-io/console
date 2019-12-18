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
import PButton from '@/components/atoms/buttons/Button';
import { selectToCopyToClipboard } from '@/lib/util';

export default {
    name: 'PCopyButton',
    components: { PButton },
    props: {
        value: {
            type: [String, Array],
            default: '',
        },
    },
    methods: {
        copyText() {
            if (this.value instanceof Array) {
                let res = '';
                this.value.forEach((v) => {
                    res += v;
                });
                selectToCopyToClipboard(res);
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

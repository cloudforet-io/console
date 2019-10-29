<template>
    <div class="list-item">
        <pre class="indent-text">{{ indentText }}</pre>
        <slot>
            <span
                v-if="icon"
                class="icon-box"
            >
                <f-i
                    icon-style="light"
                    :icon="icon"
                />
            </span>
            <span>
                {{ contents }}
            </span>
        </slot>
    </div>
</template>

<script>
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'PListItem',
    components: { FI },
    props: {
        contents: {
            type: String,
            default: '',
        },
        icon: {
            type: String,
            default: '',
        },
        indent: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        indentText() {
            return ' '.repeat(this.indent);
        },
    },
};
</script>

<style lang="scss" scoped>
    .list-item {
        border: 1px solid red;
        .indent-text {
            display: inline;
            margin: 0;
            font-size: 1rem;
        }
        .icon-box {
            margin-right: 5px;
            border: 1px solid blue;
        }
    }
</style>

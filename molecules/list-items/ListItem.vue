<template>
    <div class="list-item" v-on="$listeners">
        <pre class="indent-text">{{ indentText }}</pre>
        <slot>
            <span>{{ contents }}</span>
        </slot>
    </div>
</template>

<script>

export default {
    name: 'PListItem',
    props: {
        contents: {
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
        text-align: left;
        border: 1px solid $primary-dark;
        padding: .5rem 1rem;
        font-size: .875rem;
        min-width: 137px;
        color: $primary;
        margin-top: -1px;
        cursor: pointer;
        &:hover {
            background-color: $primary-dark;
            color: $primary4;
        }

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

<template>
    <div :class="typeChecker" v-on="$listeners">
        <pre class="indent-text">{{ indentText }}</pre>
        <span v-if="selected" class="selected">
            <p-i name="ic_check" height=".875rem" width=".875rem"/>
        </span>
        <slot>
            <span>{{ contents }}</span>
        </slot>
    </div>
</template>

<script>
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'PListItem',
    components: { PI },
    props: {
        contents: {
            type: String,
            default: '',
        },
        indent: {
            type: Number,
            default: 0,
        },
        selected: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'GNB',
        },
    },
    computed: {
        indentText() {
            return ' '.repeat(this.indent);
        },
        typeChecker() {
            return (this.type === 'GNB') ? 'list-item-GNB' : 'list-item-CON';
        },
    },
};
</script>

<style lang="scss" scoped>
    .list-item-GNB {
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

    .list-item-CON {
        text-align: left;
        border: 1px solid $secondary;
        padding: 0px 14px 0px 14px;
        font: 14px/32px Arial;
        min-width: 137px;
        color: $secondary;
        margin-top: -1px;
        cursor: pointer;
        &:hover {
            background-color: $secondary;
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

    .list-item-CON:first-of-type{
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
    }
    .list-item-CON:last-of-type{
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;

    }
</style>

<template>
    <div :class="typeChecker" v-on="$listeners">
        <pre class="indent-text">{{ indentText }}</pre>
        <span v-if="selected" class="selected">
            <p-i name="ic_check" height=".875rem" width=".875rem" />
        </span>
        <slot>
            <span>{{ contents }}</span>
        </slot>
    </div>
</template>

<script>
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PMenuItem',
    components: { PI },
    props: {
        contents: {
            type: String,
            default: 'contents',
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

<style lang="postcss" scoped>
.list-item-GNB {
    @apply text-left border border-primary-dark text-primary;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    min-width: 137px;
    margin-top: -1px;
    cursor: pointer;
    &:hover {
        @apply bg-primary-dark text-primary4;
    }

    .indent-text {
        display: inline;
        margin: 0;
        font-size: 1rem;
    }
}

.list-item-CON {
    @apply text-left border border-secondary text-secondary;
    padding: 0 14px 0 14px;
    font: 14px/32px Arial;
    min-width: 137px;
    margin-top: -1px;
    cursor: pointer;
    &:hover {
        @apply bg-secondary text-primary4;
    }

    .indent-text {
        display: inline;
        margin: 0;
        font-size: 1rem;
    }
}

.list-item-CON:first-of-type {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
}
.list-item-CON:last-of-type {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
}
</style>

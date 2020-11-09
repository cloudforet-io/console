<template>
    <abbr class="p-abbreviation" :title="description">
        <slot>
            {{ text }}
        </slot>
    </abbr>
</template>

<script lang="ts">
import { AbbreviationProps } from '@/components/atoms/abbreviation/type';

export default {
    name: 'PAbbreviation',
    props: {
        text: {
            type: String,
            default: undefined,
        },
        description: {
            type: String,
            default: undefined,
        },
    },
    setup(props: AbbreviationProps) {
        return {
        };
    },
};
</script>

<style lang="postcss">
.p-abbreviation {

}
</style>

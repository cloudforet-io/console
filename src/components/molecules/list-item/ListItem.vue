<template>
    <div class="list-item">
        <slot>
            <span v-if="icon" class="icon-box">
                <f-i icon-style="light" :icon="icon"/>
            </span>
            <span>
                {{contents}}
            </span>
        </slot>
    </div>
</template>

<script>
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'p-list-item',
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
    },
    computed: {
    },
};
</script>

<style lang="scss" scoped>
    .list-item {
        border: 1px solid red;
    }
    icon-box {
        margin-right: 5px;
        border: 1px solid blue;
    }
</style>

<template>
    <p-badge class="p-tag" :class="{deletable: deletable}"
             style-type="gray200" v-on="$listeners"
    >
        <slot />
        <p-i v-if="deletable" name="ic_delete" width="1rem"
             height="1rem" class="icon"
             color="transparent inherit"
             @click="$emit('delete')"
        />
    </p-badge>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    ref, reactive, Ref, defineComponent,
} from '@vue/composition-api';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'PTag',
    components: {
        PBadge,
        PI,
    },
    props: {
        deletable: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        return { };
    },
});
</script>

<style lang="postcss" scoped>
    .p-tag {
        margin-right: 0.5rem;
        vertical-align: middle;
        white-space: nowrap;
        color: inherit;
        &.deletable {
            padding-right: 0.15rem;
            .icon {
                @apply text-gray-400;
                cursor: pointer;
            }
            &:hover {
                @apply bg-gray-100;
                .icon {
                    @apply text-alert;
                }
            }
        }
    }
</style>

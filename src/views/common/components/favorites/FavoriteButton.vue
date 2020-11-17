<template>
    <p-i v-show="readOnly ? active : true"
         name="ic_bookmark"
         width="1rem" height="1rem"
         :scale="scale"
         color="transparent inherit"
         class="favorite-btn"
         :class="{active, 'read-only': readOnly}"
         @click.prevent="onClickProjectFavorite"
    />
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { FavoriteButtonProps } from '@/views/project/project/type';

export default {
    name: 'FavoriteButton',
    components: { PI },
    props: {
        itemId: {
            type: String,
            required: true,
        },
        favoriteType: {
            type: String,
            required: true,
        },
        resourceType: {
            type: String,
            required: true,
        },
        scale: {
            type: String,
            default: '1',
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: FavoriteButtonProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            itemMap: computed(() => vm.$store.getters[`favorite/${props.favoriteType}/itemMap`]),
            active: computed(() => !!state.itemMap[props.itemId]),
        });

        const onClickProjectFavorite = async () => {
            if (props.readOnly) return;
            if (state.itemMap[props.itemId]) {
                await vm.$store.dispatch(`favorite/${props.favoriteType}/removeItem`, { id: props.itemId });
            } else {
                await vm.$store.dispatch(`favorite/${props.favoriteType}/addItem`, {
                    id: props.itemId,
                    resourceType: props.resourceType,
                });
            }
        };
        return {
            ...toRefs(state),
            onClickProjectFavorite,
        };
    },
};
</script>

<style lang="postcss" scoped>
.favorite-btn {
    @apply text-gray-200;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:not(.read-only) {
        cursor: pointer;
        &:hover {
            transform: scale(1.5);
            &:not(.active) {
                @apply text-gray-300;
            }
        }
    }
    &.active {
        @apply text-yellow-500;
    }
}
</style>

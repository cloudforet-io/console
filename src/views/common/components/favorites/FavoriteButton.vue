<template>
    <p-i name="ic_bookmark" width="1rem" height="1rem"
         color="transparent inherit"
         class="favorite-btn"
         :class="{active}"
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
    },
    setup(props: FavoriteButtonProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            itemMap: computed(() => vm.$store.getters[`favorite/${props.favoriteType}/itemMap`]),
            active: computed(() => !!state.itemMap[props.itemId]),
        });

        const onClickProjectFavorite = async () => {
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
    &.active {
        @apply text-yellow-500;
    }
    &:hover {
        transform: scale(1.4);
    }
}
</style>

<template>
    <p-badge class="filter-badge" style-type="gray2" v-on="$listeners">
        <slot />
        <p-i name="ic_delete" width="1rem" height="1rem"
             class="icon"
             :color="`transparent inherit`"
             @click="$emit('delete', $event)"
        />
    </p-badge>
</template>

<script>
import PBadge from '@/components/atoms/badges/Badge';
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'PFilterBadge',
    events: ['delete'],
    components: {
        PBadge,
        PI,
    },
    setup() {
        return {  };
    },
};
</script>

<style lang="scss" scoped>
    .filter-badge {
        margin-right: .5rem;
        vertical-align: middle;
        padding-right: 0.15rem;
        .icon {
            color: $gray1;
            cursor: pointer;
        }
        &:hover {
            color: $gray2;
            background-color: $gray3;
            .icon {
                color: $alert;
            }

        }
    }
</style>

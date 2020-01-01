<template>
    <div>
        <p-filter-badge v-for="(type, filter) in filters" :key="filter"
                        @delete="onDelete(filter, type, $event)"
        >
            {{ filter }}
        </p-filter-badge>
    </div>
</template>

<script>
import PFilterBadge from '@/components/molecules/badges/filter-badge/FilterBadge';

export default {
    name: 'FilterBadgeList',
    events: ['update:filters', 'delete'],
    components: {
        PFilterBadge,
    },
    props: {
        filters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, context) {
        const onDelete = (filter, type, e) => {
            const updatedFilters = { ...props.filters };
            delete updatedFilters[filter];
            context.emit('update:filters', updatedFilters);
            context.emit('delete', filter, type, e);
        };
        return {
            onDelete,
        };
    },
};
</script>

<style lang="scss" scoped>
    .filter-container {
        margin-bottom: 1.5rem;
    }
</style>

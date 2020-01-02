<template>
    <p-badge class="filter-badge" style-type="gray2" v-on="$listeners">
        <slot />
        <p-i name="ic_delete" width="1rem" height="1rem"
             class="icon"
             :color="`transparent inherit`"
             @click="$emit('delete', idx)"
        />
    </p-badge>
</template>

<script>
import _ from 'lodash';
import { ref, reactive } from '@vue/composition-api';
import PBadge from '@/components/atoms/badges/Badge';
import PI from '@/components/atoms/icons/PI';

export const filterBadgeList = (proxyFilters, checkDuplicate = true) => {
    const filters = proxyFilters || ref([]);

    const deleteTag = (idx) => {
        const updatedFilters = [...filters.value];
        updatedFilters.splice(idx, 1);
        filters.value = updatedFilters;
    };

    const validation = value => filters.value.every(filter => !_.isEqual(filter, value));

    const addTag = (value) => {
        if (checkDuplicate && !validation(value)) return;
        const updatedFilters = [...filters.value];
        updatedFilters.push(value);
        filters.value = updatedFilters;
    };

    return reactive({
        filters,
        deleteTag,
        addTag,
    });
};

export default {
    name: 'PFilterBadge',
    events: ['delete'],
    components: {
        PBadge,
        PI,
    },
    props: {
        idx: {
            type: Number,
        },
    },
    setup() {
        return { };
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

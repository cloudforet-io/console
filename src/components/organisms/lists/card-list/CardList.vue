<template>
    <div>
        <p-card-item v-for="(item, idx) in items" :key="getItem(item, mapper.key)"
                     :icon="getItem(item, mapper.icon)"
                     :title="getItem(item, mapper.title)"
                     :contents="getItem(item, mapper.contents)"
                     class="item"
                     @click="$emit('itemClick', item, $event)"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" :items="items"
                      :item="item" :index="idx"
                />
            </template>
        </p-card-item>
    </div>
</template>

<script>
import _ from 'lodash';
import PCardItem from '@/components/molecules/cards/CardItem.vue';

export default {
    name: 'CardList',
    slots: ['side', 'body', 'extra'],
    events: ['itemClick'],
    components: {
        PCardItem,
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        mapper: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const getItem = (item, key) => _.get(item, key);
        return {
            getItem,
        };
    },
};
</script>

<style lang="scss" scoped>
    .item {
        margin-bottom: 1rem;
    }

</style>

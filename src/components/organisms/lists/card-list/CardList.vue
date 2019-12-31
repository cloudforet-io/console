<template>
    <div>
        <p-card-item v-for="item in items" :key="item[mapper.key]"
                     :icon="item[mapper.icon]"
                     :title="item[mapper.title]"
                     :contents="item[mapper.contents]"
                     class="item"
                     @click="$emit('itemClick', item, $event)"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" :items="items" />
            </template>
        </p-card-item>
    </div>
</template>

<script>
import PCardItem from '@/components/molecules/cards/CardItem';

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
        return {};
    },
};
</script>

<style lang="scss" scoped>
    .item {
        margin-bottom: 1rem;
    }

</style>

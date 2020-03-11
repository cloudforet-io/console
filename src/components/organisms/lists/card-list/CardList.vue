<template>
    <div>
        <div v-if="loading" class="card-list-spinner-container">
            <p-lottie name="spinner"
                      auto
                      :size="1.5"
            />
        </div>
        <template v-else-if="items.length > 0">
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
        </template>
        <p-empty v-else>
            No Plugins
        </p-empty>
    </div>
</template>

<script>
import _ from 'lodash';
import PCardItem from '@/components/molecules/cards/CardItem.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';

export default {
    name: 'CardList',
    slots: ['side', 'body', 'extra'],
    events: ['itemClick'],
    components: {
        PCardItem,
        PLottie,
        PEmpty,
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
        loading: {
            type: Boolean,
            default: false,
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

<style lang="postcss" scoped>
    .card-list-spinner-container {
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
    }
    .item {
        margin-bottom: 1rem;
    }

</style>

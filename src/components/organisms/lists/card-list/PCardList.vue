<template>
    <fragment>
        <div v-if="loading" class="-spinner-container">
            <!-- TODO: Skeletons -->
            <p-lottie name="spinner" auto :size="1.5" />
        </div>
        <template v-else-if="items.length > 0">
            <p-card-item v-for="(item, idx) in items" :key="getItem(item, mapper.key, idx)"
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
        <slot v-else name="no-data">
            <p-empty>
                No Data
            </p-empty>
        </slot>
    </fragment>
</template>

<script lang="ts">
import _ from 'lodash';
import PCardItem from '@/components/molecules/cards/PCardItem.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { defineComponent } from '@vue/composition-api';
import { cardListProps } from '@/components/organisms/lists/card-list/PCardList.toolset';

export default defineComponent({
    name: 'PCardList',
    components: {
        PCardItem,
        PLottie,
        PEmpty,
    },
    props: cardListProps,
    setup() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getItem = (item, key: string|undefined, defaultValue: any = ''): any => _.get(item, key || '', defaultValue);
        return {
            getItem,
        };
    },
});
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

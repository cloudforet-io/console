<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PLazyImg, PI, PTextHighlighting } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import type { ReferenceData } from '@/lib/helper/config-data-helper';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { indigo, peacock } from '@/styles/colors';

interface Props {
    item?: ReferenceData;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const state = reactive({
    iconColor: computed<string|undefined>(() => {
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT) {
            return peacock[700];
        }
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            return indigo[500];
        }
        return undefined;
    }),
});
</script>

<template>
    <div class="user-configs-item">
        <span class="image">
            <p-lazy-img v-if="props.item.itemType === FAVORITE_TYPE.CLOUD_SERVICE
                            || props.item.itemType === FAVORITE_TYPE.SECURITY
                            || props.item.itemType === RECENT_TYPE.CLOUD_SERVICE_TYPE
                        "
                        :src="assetUrlConverter(props.item.icon || '')"
                        width="1rem"
                        height="1rem"
            />
            <p-i v-else
                 :name="props.item.icon"
                 width="1rem"
                 height="1rem"
                 :color="state.iconColor"
            />
        </span>
        <span class="texts">
            <template v-if="props.item.parents">
                <template v-for="(parent, pIdx) in props.item.parents">
                    <p-text-highlighting :key="`parent-${parent.label}-${pIdx}`"
                                         class="text-item"
                                         :text="parent.label"
                    />
                    <span :key="`arrow-${pIdx}`">
                        <p-i name="ic_chevron-right-thin"
                             width="1rem"
                             height="1rem"
                        />
                    </span>
                </template>
            </template>
            <p-text-highlighting :key="`leaf-${item.label}`"
                                 class="text-item"
                                 :text="item.label"
            />
        </span>
    </div>
</template>

<style scoped lang="postcss">
.user-configs-item {
    @apply relative flex items-center;
    width: 100%;
    .image {
        padding: 0.5rem;
    }
    .texts {
        @apply truncate;
        width: calc(100% - 2rem);
    }
}
</style>

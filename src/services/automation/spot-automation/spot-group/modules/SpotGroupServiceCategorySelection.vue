<template>
    <spot-group-add-section :title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.LABEL')">
        <div v-for="(item, i) in supportedResourceTypeItems" :key="i" class="resource-type-wrapper"
             :class="{selected: item.name === selectedResourceTypeItem.name}"
             @click="onSelectResourceType(i)"
        >
            <p-radio :selected="item.name === selectedResourceTypeItem.name" :value="true" class="radio"
                     @click.stop="onSelectResourceType(i)"
            >
                <template #icon>
                    <p-i v-if="item.name === selectedResourceTypeItem.name"
                         name="ic_checkbox_circle--checked"
                    />
                </template>
            </p-radio>
            <div class="resource-type">
                <p-lazy-img :src="assetUrlConverter(item.data.icon)" />
                <br>
                <span class="name">{{ item.label }}</span>
            </div>
        </div>
    </spot-group-add-section>
</template>

<script lang="ts">
import { PI, PLazyImg, PRadio } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { map } from 'lodash';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { SpotGroupResourceCategory } from '@/services/automation/spot-automation/type';
import SpotGroupAddSection from '@/services/automation/spot-automation/spot-group/components/SpotGroupAddSection.vue';
import { assetUrlConverter } from '@/lib/helper/asset-helper';

interface SupportResourceGroupTypes {
    [resourceType: string]: {
        name: string;
        // eslint-disable-next-line camelcase
        recommended_title: string;
        icon: string;
    };
}

interface SelectedResourceTypeItem {
    label: string;
    name: string;
    type: 'item';
    data: SpotGroupResourceCategory;
}

export default {
    name: 'SpotGroupServiceCategorySelection',
    components: {
        SpotGroupAddSection,
        PRadio,
        PI,
        PLazyImg,
    },
    setup(props, { emit }) {
        const state = reactive({
            showSelectValidation: props.showValidation,
            supportedResourceTypes: {} as SupportResourceGroupTypes,
            supportedResourceTypeItems: computed<SelectedResourceTypeItem[]>(() => map(state.supportedResourceTypes, (d, k) => {
                const options: any = {};
                const queryString = k.split('?')[1] || '';
                if (queryString) {
                    const optionsSplit = queryString?.split('&');
                    optionsSplit.forEach((op) => {
                        if (op) {
                            const str = op.split('=');
                            options[str[0]] = str[1];
                        }
                    });
                }

                const res: SelectedResourceTypeItem = {
                    label: d.name,
                    name: k,
                    type: 'item',
                    data: {
                        options,
                        resourceType: k.split('?')[0],
                        icon: d.icon,
                        label: d.name,
                        name: k,
                    },
                };

                return res;
            })),
            selectedResourceTypeIndex: 0,
            selectedResourceTypeItem: computed<SelectedResourceTypeItem|null>(() => state.supportedResourceTypeItems[state.selectedResourceTypeIndex] || null),
        });

        const emitChange = () => {
            emit('change', state.selectedResourceTypeItem?.data || null);
        };

        const onSelectResourceType = (i) => {
            if (state.selectedResourceTypeIndex === i) return;
            state.selectedResourceTypeIndex = i;
            emitChange();
        };

        const getSupportedResourceTypes = async () => {
            try {
                state.supportedResourceTypes = await SpaceConnector.client.spotAutomation.spotGroup.getSupportedResourceTypes();
            } catch (e) {
                console.error(e);
                state.supportedResourceTypes = {};
            }
        };

        /* Init */
        (async () => {
            await getSupportedResourceTypes();
            emitChange();
        })();

        return {
            ...toRefs(state),
            onSelectResourceType,
            assetUrlConverter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.resource-type-wrapper {
    @apply bg-white border-gray-200 text-gray-900;
    position: relative;
    border-width: 1px;
    border-radius: 4px;
    min-width: 7.375rem;
    max-width: 16.5rem;
    padding: 2rem 0.5rem;
    cursor: pointer;
    &.selected {
        @apply border-secondary text-secondary;
    }
    .radio {
        @apply absolute;
        left: 0.75rem;
        top: 0.75rem;
    }
    .resource-type {
        @apply flex flex-col items-center justify-center;
    }
    .name {
        color: inherit;
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.2;
    }

    @media (hover: hover) {
        &:hover {
            @apply bg-secondary2;
        }
    }
}
</style>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PCard, PI, PButton, PPaneLayout,
} from '@cloudforet/mirinae';

import {
    useCollectorFormStore,
} from '@/services/asset-inventory/stores/collector-form-store';
import type { AdditionalRule } from '@/services/asset-inventory/types/type';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const state = reactive({
    orderedCardData: computed<AdditionalRule[]>(() => {
        const data = collectorFormState.additionalRules;
        return data.sort((a, b) => a.order - b.order);
    }),
});

const changeOrder = (targetData, clickedData, tempOrder) => {
    if (targetData.order < clickedData.order) {
        targetData.order = tempOrder;
        clickedData.order = tempOrder - 1;
    } else {
        targetData.order = tempOrder;
        clickedData.order = tempOrder + 1;
    }
};
const handleClickUpButton = async (data) => {
    const tempCardData = [...collectorFormState.additionalRules];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
    } catch (e) {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
    } finally {
        collectorFormState.additionalRules = tempCardData;
    }
};
const handleClickDownButton = async (data) => {
    const tempCardData = [...collectorFormState.additionalRules];
    const tempOrder = data.order;
    try {
        changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
    } catch (e) {
        changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
    } finally {
        collectorFormState.additionalRules = tempCardData;
    }
};

const handleClickDeleteButton = (order: number) => {
    collectorFormStore.$patch((_state) => {
        const tempRules = collectorFormState.additionalRules.filter((data) => data.order !== order);
        _state.state.additionalRules = tempRules.map((data, index) => {
            data.order = index + 1;
            return data;
        });
    });
};

const handleClickAddEventRule = async () => {
    collectorFormState.additionalRules = [...collectorFormState.additionalRules, { order: collectorFormState.additionalRules.length + 1 }];
};

</script>

<template>
    <p-pane-layout class="collector-create-form-rule">
        <p-heading class="additional-options-label"
                   :title="$t('INVENTORY.COLLECTOR.ADDITIONAL_RULE')"
                   heading-type="sub"
        />
        <div class="card-list-wrapper">
            <p-card v-for="data in state.orderedCardData"
                    :key="data.order"
                    style-type="gray100"
            >
                <template #header>
                    <div class="card-header">
                        <div class="left-part">
                            <span class="order-text">#<strong>{{ data.order }}</strong></span>
                            <span class="arrow-button"
                                  :class="{'disabled': data.order === 1}"
                                  @click="handleClickUpButton(data)"
                            >
                                <p-i name="ic_arrow-up"
                                     width="1.5rem"
                                     height="1.5rem"
                                     color="inherit transparent"
                                />
                            </span>
                            <span class="arrow-button"
                                  :class="{'disabled': (data.order === state.orderedCardData.length)}"
                                  @click="handleClickDownButton(data)"
                            >
                                <p-i name="ic_arrow-down"
                                     width="1.5rem"
                                     height="1.5rem"
                                     color="inherit transparent"
                                />
                            </span>
                        </div>
                        <span class="text-button"
                              @click="handleClickDeleteButton(data.order)"
                        >
                            {{ $t('PROJECT.EVENT_RULE.DELETE') }}
                        </span>
                    </div>
                </template>
                <div class="additional-rule-form" />
            </p-card>
        </div>
        <div class="layout-footer">
            <p-button style-type="tertiary"
                      icon-left="ic_plus_bold"
                      class="add-event-rule-button"
                      @click="handleClickAddEventRule"
            >
                {{ $t('INVENTORY.COLLECTOR.ADD_ADDITIONAL_RULE') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>

.collector-create-form-rule {
    .additional-options-label {
        margin-bottom: 0.5rem;
    }

    .card-list-wrapper {
        @apply flex flex-col gap-4;
        margin: 1.5rem 1rem 0 1rem;

        .card-header {
            display: flex;
            justify-content: space-between;
            font-size: 1rem;
            font-weight: normal;

            .left-part {
                @apply flex items-center gap-1;

                .order-text {
                    @apply text-blue-900;
                    font-size: 1rem;
                    padding-right: 0.5rem;
                }

                .arrow-button {
                    @apply cursor-pointer text-gray-800;
                    &.disabled {
                        @apply pointer-events-none cursor-not-allowed text-gray-200;
                    }
                    &:hover {
                        @apply text-secondary;
                    }
                }
            }

            .text-button {
                @apply text-gray-700;
                font-size: 0.875rem;
                cursor: pointer;
                margin: 0 0.75rem;

                &:hover {
                    @apply text-alert underline;
                }
            }
        }

        .additional-rule-form {
            padding: 2rem 1.5rem;
        }
    }

    .layout-footer {
        margin: 0 1rem 1.5rem 1rem;
        .add-event-rule-button {
            margin: 1rem 0;
            width: 100%;
        }
    }
}
</style>

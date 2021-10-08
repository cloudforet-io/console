<template>
    <p-button-modal
        :header-title="'Set Budget Alert'"
        centered
        size="lg"
        fade
        :scrollable="false"
        backdrop
        :visible.sync="proxyVisible"
        @confirm="handleConfirm"
    >
        <template #body>
            When <b>any</b> of the following conditions are met, a notification will be sent immediately to the set immediately.<br>
            <p-anchor class="anchor"
                      :text="'Set Notifications'"
                      :href="'/'"
                      highlight
            />
            <p-icon-text-button name="ic_plus_bold" outline
                                style-type="gray900"
                                @click="handleAddCondition"
            >
                Add Alert Condition
            </p-icon-text-button>
            <section class="condition-wrapper">
                <p v-if="conditions.length > 0" class="condition-header">
                    <span>Unit</span>
                    <span>Threshold</span>
                    <span>Type</span>
                </p>
                <template v-for="(condition, idx) of conditions">
                    <article :key="`condition-${idx}`" class="condition-input-wrapper">
                        <p-select-dropdown v-model="condition.notification_unit"
                                           class="condition"
                                           :items="units"
                                           use-fixed-menu-style
                        />
                        <p-text-input v-model="condition.threshold"
                                      class="condition"
                                      :placeholder="condition.notification_unit === NOTIFICATION_UNIT.ACTUAL_COST
                                          ? '$1000' : '50'"
                        >
                            <template #right-extra>
                                <span v-if="condition.notification_unit === NOTIFICATION_UNIT.PERCENT" class="text-gray-400">%</span>
                            </template>
                        </p-text-input>
                        <p-select-dropdown v-model="condition.notification_type"
                                           class="condition"
                                           :items="types"
                                           use-fixed-menu-style
                        >
                            <span :class="{'text-alert': condition.notification_type === NOTIFICATION_TYPE.CRITICAL}">
                                {{ types.find(d => d.name === condition.notification_type).label }}
                            </span>
                        </p-select-dropdown>
                        <p-icon-button name="ic_trashcan"
                                       class="delete-button"
                                       @click="handleDeleteCondition(idx)"
                        />
                    </article>
                </template>
            </section>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PButtonModal, PFieldGroup, PTextInput, PAnchor, PIconTextButton, PSelectDropdown, PIconButton,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';

const NOTIFICATION_UNIT = Object.freeze({
    PERCENT: 'PERCENT',
    ACTUAL_COST: 'ACTUAL_COST',
});
type NotificationUnit = keyof typeof NOTIFICATION_UNIT;

const NOTIFICATION_TYPE = {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
};
type NotificationType = keyof typeof NOTIFICATION_TYPE;

interface Condition {
    notification_unit?: NotificationUnit;
    threshold?: number | null;
    notification_type?: NotificationType;
}

export default {
    name: 'BudgetAlertModal',
    components: {
        PButtonModal,
        PAnchor,
        PIconTextButton,
        PTextInput,
        PSelectDropdown,
        PIconButton,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            loading: true,
            proxyVisible: makeProxy('visible', props, emit),
            conditions: [] as Condition[],
            units: computed(() => ([
                {
                    name: NOTIFICATION_UNIT.ACTUAL_COST,
                    label: 'Actual Cost',
                },
                {
                    name: NOTIFICATION_UNIT.PERCENT,
                    label: '% of Budget',
                },
            ])),
            types: computed(() => ([
                {
                    name: NOTIFICATION_TYPE.WARNING,
                    label: 'Warning',
                },
                {
                    name: NOTIFICATION_TYPE.CRITICAL,
                    label: 'Critical',
                },
            ])),
            thresholdPlaceholder: '',
        });

        const handleAddCondition = () => {
            state.conditions.push({
                notification_unit: 'ACTUAL_COST',
                threshold: null,
                notification_type: 'WARNING',
            });
        };

        const handleDeleteCondition = (idx) => {
            const conditions = [...state.conditions];
            conditions.splice(idx, 1);
            state.conditions = conditions;
        };

        const setBudgetAlert = async () => {
            try {
                // TODO: set budget alert API
                console.log('set budget alert');
            } catch (e) {
                console.error(e);
            }
        };

        const handleConfirm = async () => {
            await setBudgetAlert();
            state.proxyVisible = false;
            emit('confirm');
        };

        return {
            ...toRefs(state),
            handleAddCondition,
            handleConfirm,
            handleDeleteCondition,
            NOTIFICATION_UNIT,
            NOTIFICATION_TYPE
        };
    },
};
</script>

<style lang="postcss">
.anchor {
    @apply block;
    margin-top: 0.25rem;
    margin-bottom: 1.5rem;
}
.condition-wrapper {
    display: flex;
    flex-direction: column;
}
.condition-header {
    @apply grid font-bold;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(auto-fill, 12.5rem);
    font-size: 0.875rem;
    line-height: 140%;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}
.condition-input-wrapper {
    display: inline-flex;
    column-gap: 0.5rem;
    margin-bottom: 0.5rem;
    .condition {
        width: 12.5rem;
    }
}


</style>

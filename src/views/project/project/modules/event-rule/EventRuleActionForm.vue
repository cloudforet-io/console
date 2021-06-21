<template>
    <section class="event-rule-action-form">
        <p class="title-wrapper">
            <strong>{{ $t('PROJECT.EVENT_RULE.DO') }}</strong> {{ $t('PROJECT.EVENT_RULE.THESE_THINGS') }}
        </p>
        <div class="content-wrapper">
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.NOTIFICATIONS') }}</p>
                <div>
                    <span class="toggle-text" :class="{on: formState.enableNotifications}">
                        {{ formState.enableNotifications ? $t('PROJECT.EVENT_RULE.ON') : $t('PROJECT.EVENT_RULE.PAUSE') }}
                    </span>
                    <p-toggle-button theme="secondary"
                                     :value="formState.enableNotifications"
                                     @change="onToggleChange"
                    />
                </div>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.PROJECT_ROUTING') }}</p>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.PROJECT_DEPENDENCIES') }}</p>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.URGENCY') }}</p>
                <div>
                    <p-radio v-for="(urgency, uIdx) in urgencyList"
                             :key="`urgency-${uIdx}`"
                             v-model="formState.urgency"
                             :value="urgency.name"
                             class="mr-4"
                    >
                        {{ urgency.label }}
                    </p-radio>
                </div>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.ASSIGNEE') }}</p>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.RESPONDER') }}</p>
            </div>
            <div class="form-box">
                <p>{{ $t('PROJECT.EVENT_RULE.ADDITIONAL_INFORMATION') }}</p>
                <p-icon-text-button style-type="gray900" name="ic_plus_bold"
                                    outline
                                    class="add-button"
                                    @click="onClickAdd"
                >
                    {{ $t('PROJECT.EVENT_RULE.ADD') }}
                </p-icon-text-button>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { i18n } from '@/translations';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PToggleButton, PRadio, PIconTextButton,
} from '@spaceone/design-system';


const ALERT_URGENCY = Object.freeze({
    HIGH: 'HIGH',
    LOW: 'LOW',
});

export default {
    name: 'EventRuleActionForm',
    components: {
        PToggleButton,
        PRadio,
        PIconTextButton,
    },
    props: {},
    setup() {
        const state = reactive({
            urgencyList: computed(() => ([
                {
                    name: ALERT_URGENCY.HIGH,
                    label: i18n.t('PROJECT.EVENT_RULE.HIGH'),
                },
                {
                    name: ALERT_URGENCY.LOW,
                    label: i18n.t('PROJECT.EVENT_RULE.LOW'),
                },
            ])),
        });
        const formState = reactive({
            enableNotifications: false,
            urgency: ALERT_URGENCY.HIGH,
        });

        /* event */
        const onToggleChange = ({ value }) => {
            formState.enableNotifications = value;
        };
        const onClickAdd = () => {
            console.log('add!');
        };

        return {
            ...toRefs(state),
            formState,
            onToggleChange,
            onClickAdd,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title-wrapper {
    font-size: 1rem;
    line-height: 2;
    margin-bottom: 0.75rem;
}
.content-wrapper {
    @apply border border-gray-100 rounded-md;
    border-width: 0.25rem;
    font-size: 0.875rem;

    .form-box {
        @apply border-b border-gray-100;
        display: flex;
        justify-content: space-between;
        border-bottom-width: 0.25rem;
        padding: 1rem;
        &:last-child {
            border: none;
        }

        .toggle-text {
            @apply text-gray-500;
            padding-right: 0.5rem;
            &.on {
                @apply text-secondary;
            }
        }
    }
}
</style>

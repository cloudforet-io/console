<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PRadio, PSelectDropdown, PTextInput, PIconButton, PDivider,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookListParameters } from '@/schema/monitoring/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';



const CONDITIONS_POLICY = Object.freeze({
    ALL: 'ALL',
    ANY: 'ANY',
});
const OPERATOR = Object.freeze({
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
});

interface Props {
    conditionsPolicy?: string;
    conditions?: any[]; // HACK: set type
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    conditionsPolicy: 'ALL',
    conditions: () => ([]),
    projectId: undefined,
});
const emit = defineEmits<{(e: 'update:conditions-policy'): void;
    (e: 'update:conditions'): void;
}>();

const state = reactive({
    conditionsPolicies: computed(() => ([
        {
            name: CONDITIONS_POLICY.ALL,
            label: i18n.t('PROJECT.EVENT_RULE.ALL'),
        },
        {
            name: CONDITIONS_POLICY.ANY,
            label: i18n.t('PROJECT.EVENT_RULE.ANY'),
        },
    ])),
    operators: computed(() => ([
        {
            name: OPERATOR.contain,
            label: i18n.t('PROJECT.EVENT_RULE.CONTAINS'),
        },
        {
            name: OPERATOR.not_contain,
            label: i18n.t('PROJECT.EVENT_RULE.DOES_NOT_CONTAIN'),
        },
        {
            name: OPERATOR.eq,
            label: i18n.t('PROJECT.EVENT_RULE.EQUALS'),
        },
        {
            name: OPERATOR.not,
            label: i18n.t('PROJECT.EVENT_RULE.DOES_NOT_EQUAL'),
        },
    ])),
    proxyConditionsPolicy: useProxyValue('conditionsPolicy', props, emit),
    proxyConditions: useProxyValue('conditions', props, emit),
    keys: [
        {
            name: 'title',
            label: 'Title',
        },
        {
            name: 'rule',
            label: 'Rule',
        },
        {
            name: 'webhook_id',
            label: 'Webhook ID',
        },
        {
            name: 'resource_id',
            label: 'Resource ID',
        },
    ],
    webhookList: [] as SelectDropdownMenuItem[],
});

/* event */
const onClickAdd = () => {
    state.proxyConditions.push({
        key: 'title',
        value: '',
        operator: OPERATOR.contain,
    });
};
const onClickDelete = (idx) => {
    const conditions = [...state.proxyConditions];
    conditions.splice(idx, 1);
    state.proxyConditions = conditions;
};

const webhookListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);
const listWebhooks = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.monitoring.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            project_id: props.projectId,
            query: webhookListApiQueryHelper.data,
        });
        state.webhookList = (results || []).map((i) => ({
            label: i.name,
            name: i.webhook_id,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookList = [];
    }
};

onMounted(() => {
    listWebhooks();
});
</script>

<template>
    <section class="event-rule-condition-form">
        <div class="title-wrapper">
            <p class="title">
                <strong>{{ $t('PROJECT.EVENT_RULE.CONDITION') }}</strong>
            </p>
            <p-button style-type="tertiary"
                      icon-left="ic_plus_bold"
                      class="add-button"
                      @click="onClickAdd"
            >
                {{ $t('PROJECT.EVENT_RULE.ADD') }}
            </p-button>
        </div>
        <div class="content-wrapper">
            <div class="radio-wrapper">
                <p-radio v-for="policy in state.conditionsPolicies"
                         :key="policy.name"
                         v-model="state.proxyConditionsPolicy"
                         :value="policy.name"
                         class="mr-4"
                >
                    {{ policy.label }}
                </p-radio>
                <span>{{ $t('PROJECT.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</span>
            </div>
            <template v-for="(condition, idx) of state.proxyConditions">
                <p-divider v-if="idx > 0"
                           :key="`divider-${idx}`"
                />
                <div :key="`condition-${idx}`"
                     class="input-wrapper"
                >
                    <div class="left-part">
                        <p-select-dropdown :selected.sync="condition.key"
                                           class="input"
                                           :menu="state.keys"
                                           use-fixed-menu-style
                                           is-fixed-width
                        />
                        <p-select-dropdown v-if="condition.key === 'webhook_id'"
                                           :selected.sync="condition.value"
                                           class="input"
                                           :menu="state.webhookList"
                                           use-fixed-menu-style
                                           is-fixed-width
                        />
                        <div v-else
                             class="left-part"
                        >
                            <p-select-dropdown :selected.sync="condition.operator"
                                               class="input"
                                               :menu="state.operators"
                                               use-fixed-menu-style
                                               is-fixed-width
                            />
                            <p-text-input v-model="condition.value"
                                          class="input"
                            />
                        </div>
                    </div>
                    <p-icon-button name="ic_delete"
                                   class="delete-button"
                                   :class="{ opacity: state.proxyConditions.length < 2}"
                                   @click="onClickDelete(idx)"
                    />
                </div>
            </template>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    .title {
        font-size: 1rem;
        line-height: 2;
    }
}
.content-wrapper {
    @apply border border-gray-100 rounded-md;
    border-width: 0.25rem;
    font-size: 0.875rem;
    padding: 1rem;

    .radio-wrapper {
        @apply flex items-center;
    }
    .input-wrapper {
        display: flex;
        margin-top: 0.75rem;
        gap: 0.5rem;

        .left-part {
            display: flex;
            width: 100%;
            justify-content: space-between;
            flex-grow: 1;
            gap: 0.5rem;

            .input {
                min-width: calc((100% - 1rem) / 3);
                width: inherit;
                flex-basis: 0;
                flex-grow: 1;
            }
        }
        .delete-button {
            &.opacity {
                pointer-events: none;
                opacity: 0;
            }
        }
    }
    .p-divider {
        display: none;
    }
}

@screen mobile {
    .content-wrapper {
        .input-wrapper {
            margin: 1rem 0;
            .left-part {
                display: block;
                .input {
                    width: 100%;
                    padding-bottom: 0.5rem;
                    &:last-child {
                        padding-bottom: 0;
                    }
                }
            }
        }
        .p-divider {
            display: block;
        }
    }
}
</style>

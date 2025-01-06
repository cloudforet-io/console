<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PCard, PFieldTitle, PFieldGroup, PDataLoader, PDivider, PLazyImg, PI,
} from '@cloudforet/mirinae';

import type { EventRuleGetParameters } from '@/schema/alert-manager/event-rule/api-verbs/get';
import { EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const route = useRoute();

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    loading: true,
    eventRule: {} as EventRuleModel,
});

const getWebhookIcon = (): string|undefined => {
    const webhook = storeState.webhook[state.eventRule?.webhook_id]?.data;
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};

const fetchEventRuleInfo = async () => {
    state.loading = true;
    try {
        state.eventRule = await SpaceConnector.clientV2.alertManager.eventRule.get<EventRuleGetParameters, EventRuleModel>({
            event_rule_id: route.query?.eventRuleId as string,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.eventRule = {} as EventRuleModel;
    } finally {
        state.loading = false;
    }
};

watch(() => route.query?.eventRuleId, (eventRuleId) => {
    if (eventRuleId) {
        fetchEventRuleInfo();
    }
}, { immediate: true });
</script>

<template>
    <p-data-loader class="service-detail-tabs-settings-event-rule-card"
                   :loading="state.loading"
                   :data="state.eventRule"
    >
        <p-card :header="$t('ALERT_MANAGER.EVENT_RULE.TITLE')">
            <template #header>
                <p>
                    <span class="font-bold">{{ $t('ALERT_MANAGER.EVENT_RULE.TITLE') }}</span>
                </p>
            </template>
            <div class="form-wrapper flex flex-col gap-6">
                <div class="flex flex-col gap-1">
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_NAME')"
                                       size="lg"
                                       required
                        />
                        <p-field-group class="input-form"
                                       required
                        >
                            <span>{{ state.eventRule.name }}</span>
                        </p-field-group>
                    </div>
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('ALERT_MANAGER.EVENT_RULE.LABEL_SCOPE')"
                                       size="lg"
                                       required
                        />
                        <p-field-group class="input-form scope">
                            <div class="flex items-center gap-1 text-label-md">
                                <span class="text-label-lg text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.WEBHOOK_SCOPE') }}: </span>
                                <p v-if="state.eventRule.scope === EVENT_RULE_SCOPE.GLOBAL"
                                   class="scope-wrapper"
                                >
                                    <p-i name="ic_globe-filled"
                                         height="1rem"
                                         width="1rem"
                                         color="inherit"
                                    />
                                    <span>{{ $t('ALERT_MANAGER.EVENT_RULE.GLOBAL') }}</span>
                                </p>
                                <p v-else
                                   class="scope-wrapper"
                                >
                                    <p-lazy-img :src="getWebhookIcon()"
                                                error-icon="ic_webhook"
                                                width="1rem"
                                                height="1rem"
                                                class="icon"
                                    />
                                    <span>{{ storeState.webhook[state.eventRule.webhook_id]?.label }}</span>
                                </p>
                            </div>
                        </p-field-group>
                    </div>
                    <p-divider class="divider" />
                </div>
            </div>
        </p-card>
    </p-data-loader>
</template>

<style scoped>
.service-detail-tabs-settings-event-rule-card {
    .form-wrapper {
        padding: 0.25rem 1.125rem;
        .input-form-wrapper {
            @apply flex items-center gap-2;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
            .input-form {
                margin-bottom: 0;
                &:not(.scope) {
                    @apply text-blue-800;
                }
                .scope-wrapper {
                    @apply flex items-center gap-1;
                }
            }
        }
        .divider {
            margin-top: 0.75rem;
        }
    }
}
</style>

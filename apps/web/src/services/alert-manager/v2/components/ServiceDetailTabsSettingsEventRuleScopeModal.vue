<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PSelectCard, PI, PFieldGroup, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleScopeType } from '@/schema/alert-manager/event-rule/type';
import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';


type CardType = {
    name: EventRuleScopeType;
    label: TranslateResult;
    icon: string;
};
interface Props {
    visible: boolean;
    scope?: EventRuleScopeType;
    selectedWebhook: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    scope: EVENT_RULE_SCOPE.WEBHOOK,
    selectedWebhook: '',
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'update:selected-webhook'): void;
    (e: 'update:scope'): void;
    (e: 'update:show-form-card'): void;
}>();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    dropdownLoading: false,
    webhook: [] as WebhookModel[],
    proxySelectedWebhook: useProxyValue('selectedWebhook', props, emit),
    proxySelectedScope: useProxyValue('scope', props, emit),
    webhookDropdownList: computed<SelectDropdownMenuItem[]>(() => state.webhook.map((i) => ({
        name: i.webhook_id,
        label: i.name,
    }))),
    scopeCardList: computed<CardType[]>(() => [
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.WEBHOOK_SCOPE'),
            name: EVENT_RULE_SCOPE.WEBHOOK,
            icon: 'ic_webhook',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.GLOBAL_SCOPE'),
            name: EVENT_RULE_SCOPE.GLOBAL,
            icon: 'ic_globe-filled',
        },
    ]),
});

const getWebhookIcon = (id: string): string|undefined => {
    const webhook = state.webhook.find((i) => i.webhook_id === id);
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};
const handleClickCancel = () => {
    state.proxySelectedScope = undefined;
    serviceDetailPageStore.setEventRuleScopeModalVisible(false);
};
const handleUpdateSelectWebhook = (value: string) => {
    state.proxySelectedWebhook = value;
};
const handleClickCard = () => {
    state.proxySelectedWebhook = '';
};
const handleClickConfirm = () => {
    serviceDetailPageStore.setEventRuleScopeModalVisible(false);
    serviceDetailPageStore.setShowEventRuleFormCard(true);
    serviceDetailPageStore.setIsEventRuleEditMode(false);
    replaceUrlQuery({
        webhookId: undefined,
        eventRuleId: undefined,
    });
};

const fetchWebhookList = async () => {
    state.dropdownLoading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            service_id: storeState.serviceId,
        });
        state.webhook = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhook = [];
    } finally {
        state.dropdownLoading = false;
    }
};

watch(() => storeState.serviceId, (id) => {
    if (!id) return;
    fetchWebhookList();
}, { immediate: true });

onMounted(() => {
    if (props.visible) {
        state.proxySelectedWebhook = '';
        state.proxySelectedScope = EVENT_RULE_SCOPE.WEBHOOK;
    }
});
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-event-rule-scope-modal"
                    :header-title="$t('ALERT_MANAGER.EVENT_RULE.MODAL_SCOPE_TITLE')"
                    size="sm"
                    :visible="props.visible"
                    :loading="state.loading"
                    :disabled="state.proxySelectedScope === EVENT_RULE_SCOPE.WEBHOOK && !state.proxySelectedWebhook"
                    @confirm="handleClickConfirm"
                    @cancel="handleClickCancel"
                    @close="handleClickCancel"
    >
        <template #body>
            <div class="flex flex-col gap-4 pb-7">
                <p>{{ $t('ALERT_MANAGER.EVENT_RULE.MODAL_SCOPE_DESC') }}</p>
                <div class="w-full flex gap-2">
                    <p-select-card v-for="(item, index) in state.scopeCardList"
                                   :key="`scope-${index}`"
                                   v-model="state.proxySelectedScope"
                                   :value="item.name"
                                   :show-select-marker="false"
                                   class="card flex-1"
                                   @click="handleClickCard"
                    >
                        <div class="flex items-center gap-1">
                            <p-i :name="item.icon"
                                 height="1rem"
                                 width="1rem"
                                 color="inherit"
                            />
                            <p class="text-label-md font-bold">
                                {{ item.label }}
                            </p>
                        </div>
                    </p-select-card>
                </div>
                <p-field-group v-if="state.proxySelectedScope === EVENT_RULE_SCOPE.WEBHOOK"
                               :label="$t('ALERT_MANAGER.EVENT_RULE.SELECT_WEBHOOK')"
                               required
                               class="w-full"
                >
                    <p-select-dropdown :menu="state.webhookDropdownList"
                                       :selected="state.proxySelectedWebhook"
                                       :loading="state.dropdownLoading"
                                       use-fixed-menu-style
                                       block
                                       @update:selected="handleUpdateSelectWebhook"
                    >
                        <template #dropdown-button="item">
                            <div v-if="!isEmpty(item)"
                                 class="flex items-center gap-1"
                            >
                                <p-lazy-img :src="getWebhookIcon(item.name)"
                                            error-icon="ic_webhook"
                                            width="1rem"
                                            height="1rem"
                                            class="icon"
                                />
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                        <template #menu-item--format="{ item }">
                            <div class="flex items-center gap-1">
                                <p-lazy-img :src="getWebhookIcon(item.name)"
                                            error-icon="ic_webhook"
                                            width="1rem"
                                            height="1rem"
                                            class="icon"
                                />
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-scope-modal {
    .card {
        padding: 0.5rem 1rem;
    }
}
</style>

<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    PButton, PDataLoader, screens, POverlayLayout, PI, PHeadingLayout, PHeading,
} from '@cloudforet/mirinae';

import { EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProxyValue } from '@/common/composables/proxy-state';

import ServiceDetailTabsSettingsEventRuleCard
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleCard.vue';
import ServiceDetailTabsSettingsEventRuleFormCard
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleFormCard.vue';
import ServiceDetailTabsSettingsEventRuleScopeModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleScopeModal.vue';
import ServiceDetailTabsSettingsEventRuleSidebar
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleSidebar.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const { hasReadWriteAccess } = usePageEditableStatus();
const { width } = useWindowSize();

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const headerEl = ref<HTMLElement|null>(null);

const emit = defineEmits<{(e: 'update:visible', value: string): void }>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    modalVisible: computed<boolean>(() => serviceDetailPageState.eventRuleScopeModalVisible),
    items: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    eventRuleList: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    loading: true,
    selectedScope: EVENT_RULE_SCOPE.WEBHOOK,
    selectedWebhook: '',
    hideSidebar: false,
    headerHeight: computed(() => useElementSize(headerEl).height), // 58 is the padding of the header
});

const handleClickAddRule = () => {
    serviceDetailPageStore.setEventRuleScopeModalVisible(true);
};

watch(() => storeState.serviceId, async (id) => {
    if (!id) return;
    try {
        state.loading = true;
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
    } finally {
        state.loading = false;
    }
}, { immediate: true });

onUnmounted(() => {
    serviceDetailPageStore.initEventRuleState();
});
</script>

<template>
    <p-overlay-layout class="service-detail-tabs-settings-event-rule pt-6 pb-10 relative"
                      size="lg"
                      :visible="state.proxyVisible"
                      @close="state.proxyVisible = false"
    >
        <template #header>
            <p-heading-layout ref="headerEl">
                <template #heading>
                    <p-heading haeding-type="sub">
                        <template #title>
                            <p class="inline-block text-label-xl leading-8">
                                {{ $t('ALERT_MANAGER.EVENT_RULE.TITLE') }}
                            </p>
                        </template>
                        <template v-if="!state.isMobileSize"
                                  #title-right-extra
                        >
                            <div class="inline-flex items-center gap-1 text-gray-700 text-label-sm">
                                <p-i name="ic_info-circle"
                                     class="title-tooltip"
                                     height="0.875rem"
                                     width="0.875rem"
                                />
                                <span>{{ $t('ALERT_MANAGER.EVENT_RULE.DESC') }}</span>
                            </div>
                        </template>
                    </p-heading>
                </template>
                <template v-if="hasReadWriteAccess"
                          #extra
                >
                    <p-button icon-left="ic_plus_bold"
                              class="self-start mx-auto"
                              style-type="secondary"
                              @click="handleClickAddRule"
                    >
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_ADD_RULE') }}
                    </p-button>
                </template>
            </p-heading-layout>
        </template>
        <div class="loader">
            <service-detail-tabs-settings-event-rule-sidebar v-if="!state.loading && storeState.items.length > 0"
                                                             :items="storeState.items"
                                                             :header-height="state.headerHeight.value"
            />
            <p-data-loader :loading="state.loading"
                           :data="!storeState.showEventRuleFormCard ? storeState.items : true"
            >
                <div class="flex-1 p-6">
                    <service-detail-tabs-settings-event-rule-form-card v-if="storeState.showEventRuleFormCard"
                                                                       :selected-webhook="storeState.isEventRuleEditMode ? storeState.eventRuleInfo.webhook_id : state.selectedWebhook"
                                                                       :selected-scope="storeState.isEventRuleEditMode ? storeState.eventRuleInfo.scope : state.selectedScope"
                                                                       class="flex-1"
                    />
                    <service-detail-tabs-settings-event-rule-card v-else-if="storeState.eventRuleInfo.event_rule_id"
                                                                  class="flex-1"
                    />
                </div>
                <template #no-data>
                    <div class="w-full flex flex-col items-center justify-center gap-6 m-6 pt-10 pb-10 border border-gray-300 rounded-xl">
                        <p class="text-label-xl text-gray-900">
                            {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_TITLE') }}
                        </p>
                        <p class="text-paragraph-md text-gray-500 whitespace-pre-wrap text-center">
                            {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_HELP_TEXT') }}
                        </p>
                        <p-button v-if="hasReadWriteAccess"
                                  icon-left="ic_plus_bold"
                                  class="self-start mx-auto"
                                  @click="handleClickAddRule"
                        >
                            {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_ADD_RULE') }}
                        </p-button>
                    </div>
                </template>
            </p-data-loader>
        </div>
        <service-detail-tabs-settings-event-rule-scope-modal v-if="hasReadWriteAccess && storeState.modalVisible"
                                                             :visible="hasReadWriteAccess && storeState.modalVisible"
                                                             :scope.sync="state.selectedScope"
                                                             :selected-webhook.sync="state.selectedWebhook"
        />
    </p-overlay-layout>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule {
    .loader {
        @apply w-full flex overflow-hidden border-t border-gray-200;
        min-height: 14rem;
    }
}
</style>

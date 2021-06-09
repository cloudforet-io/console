<template>
    <p-pane-layout class="alert-detail-responder">
        <article class="responder-wrapper">
            <p-panel-top class="-ml-1">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.RESPONDER') }}
            </p-panel-top>
            <p-collapsible-list :items="items" theme="card">
                <template #title="{title, index}">
                    <span class="level" :class="{'current': index + 1 === alertData.escalation_level}">{{ title }}</span>
                    <span class="level font-bold" :class="{'current': index + 1 === alertData.escalation_level}"> {{ index+1 }} </span>
                    <p-badge v-if="index + 1 === alertData.escalation_level" style-type="primary3">
                        {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.CURRENT') }}
                    </p-badge>
                </template>
                <template #default="{data}">
                    <p class="data-wrapper">
                        whdalsrnt@gmail.com
                        <!--                        {{ alertData.responders[0].resource_id }}-->
                    </p>
                </template>
            </p-collapsible-list>
            <p class="search-title">
                {{ $t('MONITORING.ALERT.DETAIL.RESPONDER.ADDITIONAL_RESPONDER') }}
            </p>
            <p-autocomplete-search v-model="responderState.search" :menu="responderState.allMemberItems" :loading="responderState.loading"
                                   class="autocomplete-search" @select-menu="onSelectMember"
            >
                <template #menu-item--format="{item, id}">
                    <p-check-box :id="id" v-model="responderState.selectedMemberItems" class="tag-menu-item"
                                 :value="item.name"
                    >
                        {{ item.label }}
                    </p-check-box>
                </template>
                <template #menu-no-data-format>
                    <div v-if="responderState.loading" class="fake-no-data" />
                </template>
            </p-autocomplete-search>
            <div class="tag-box">
                <p-tag v-for="(tag, i) in responderState.selectedMemberItems" :key="tag" @delete="onDeleteTag(i)">
                    {{ tag ? tag : '' }}
                </p-tag>
            </div>
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PAutocompleteSearch,
    PBadge, PCheckBox, PCollapsibleList, PPaneLayout, PPanelTop, PTag,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { TimeStamp } from '@/models';
import { ALERT_SEVERITY, ALERT_STATE, ALERT_URGENCY } from '@/views/monitoring/alert/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { ApiQueryHelper } from '@/lib/space-connector/helper';

export default {
    name: 'AlertDetailResponder',
    components: {
        PPaneLayout,
        PPanelTop,
        PCollapsibleList,
        PBadge,
        PAutocompleteSearch,
        PCheckBox,
        PTag,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
        alertData: {
            type: Object,
            default: null,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: [
                { title: vm.$t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'test' },
                { title: vm.$t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'test' },
                { title: vm.$t('MONITORING.ALERT.DETAIL.RESPONDER.LEVEL'), data: 'test' },
            ],
            loading: true,
        });

        const responderState = reactive({
            search: '',
            loading: true,
            allMember: [] as string[],
            allMemberItems: computed(() => responderState.allMember.map(d => ({
                name: d.user_id,
                label: d.name,
                type: 'item',
            }))),
            selectedMemberItems: [],
        });

        const listMember = async () => {
            responderState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.list();
                responderState.allMember = res.results;
            } catch (e) {
                responderState.allMember = [];
                console.error(e);
            } finally {
                responderState.loading = false;
            }
        };

        (async () => {
            await listMember();
        })();

        const onSelectMember = (item: MenuItem) => {
            responderState.search = '';
            // const idx = state.selectedMemberItems.findIndex(k => k === item.name);
            responderState.selectedMemberItems = [...responderState.selectedMemberItems, item.name];
        };

        const onDeleteTag = (idx) => {
            responderState.selectedMemberItems.splice(idx, 1);
            vm.$nextTick(() => {
                responderState.selectedMemberItems = [...responderState.selectedMemberItems];
            });
        };


        return {
            ...toRefs(state),
            responderState,
            onSelectMember,
            onDeleteTag,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-responder {
    padding: 0 1rem 2.5rem 1rem;
}
.level {
    font-size: 1rem;
    line-height: 125%;
    &.current {
        @apply text-violet-500;
    }
}
.data-wrapper {
    @apply bg-gray-100;
    padding: 0.5rem 0.5rem;
    min-height: 4.375rem;
}
.search-title {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 140%;
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>

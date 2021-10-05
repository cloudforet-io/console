<template>
    <span>
        <p-anchor v-if="link" :to="link">
            {{ label }}
        </p-anchor>
        <template v-else>
            {{ label }}
        </template>
    </span>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { Location } from 'vue-router';
import { PAnchor } from '@spaceone/design-system';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { store } from '@/store';
import { PROJECT_ROUTE } from '@/services/project/routes';

export default {
    name: 'AlertTriggeredBy',
    components: {
        PAnchor,
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        projectId: {
            type: String,
            default: '',
        },
        disableLink: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();

        const state = reactive({
            webhookLabel: computed<string|undefined>(() => store.state.resource.webhook.items[props.value]?.label),
            userLabel: computed<string|undefined>(() => store.state.resource.user.items[props.value]?.label),
            label: computed(() => state.webhookLabel || state.userLabel || props.value),
            link: computed<Location|undefined>(() => {
                if (props.disableLink) return undefined;
                if (state.webhookLabel) {
                    return {
                        name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                        params: {
                            id: props.projectId,
                        },
                        query: {
                            filters: queryHelper.setFilters([{ k: 'webhook_id', v: props.value, o: '=' }]).rawQueryStrings,
                        },
                    };
                } if (state.userLabel) {
                    return {
                        name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                        params: {
                            id: props.projectId,
                        },
                        query: {
                            filters: queryHelper.setFilters([{ v: props.value }]).rawQueryStrings,
                        },
                    };
                }
                return undefined;
            }),
        });


        return {
            ...toRefs(state),
        };
    },
};
</script>

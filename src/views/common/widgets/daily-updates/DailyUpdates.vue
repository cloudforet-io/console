<template>
    <p-widget-layout class="daily-updates" title="Daily Updates" help="Daily Updates">
        <p-selectable-list :items="data" :mapper="mapper" theme="card"
                           :loading="loading"
                           @selected="onSelected"
        >
            <template #contents="{item}">
                <div class="group-name">
                    {{ item.group_name }}
                </div>
                <div class="name">
                    {{ item.name }}
                </div>
            </template>
            <template #extra="{item}">
                <p-i :name="stateIcons[item.update_type]" height="0.75rem" width="0.75rem" />
                <span class="count">{{ item.count }}</span>
            </template>
        </p-selectable-list>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { safe, alert, yellow } from '@/styles/colors';

export default defineComponent({
    name: 'DailyUpdates',
    components: {
        PWidgetLayout,
        PSelectableList,
        PI,
    },
    setup() {
        const vm: any = getCurrentInstance();

        const colors = {
            ADD: safe,
            DELETE: alert,
            UPDATE: yellow.default,
        };

        const stateIcons = {
            ADD: 'ic_list_increase',
            DELETE: 'ic_list_decrease',
            UPDATE: '',
        };

        const state: any = reactive({
            data: [],
            loading: true,
        });

        const api = async () => new Promise((resolve) => {
            setTimeout(() => {
                resolve([{
                    // provider: string - provider store > icon
                    // group: string,
                    // name: string | undefined,
                    // tags: {
                    //     icon: 'http://', 비어있는 경우, provider icon 으로 대체
                    // },
                    // update_type: 'ADD' | 'DELETE'
                    // count: number
                    resource_id: 'AWS',
                    group_name: 'Group Name',
                    name: 'Resource Name',
                    update_type: 'ADD',
                    tags: {
                        icon: 'http://',
                    },
                    count: 0,
                }, {
                    resource_id: 'GCP',
                    group_name: 'Group Name',
                    name: 'Resource Name',
                    update_type: 'UPDATE',
                    tags: {
                        icon: 'http://',
                    },
                    count: 0,
                }, {
                    resource_id: 'Azure',
                    group_name: 'Group Name',
                    name: 'Resource Name',
                    update_type: 'DELETE',
                    tags: {
                        icon: 'http://',
                    },
                    count: 0,
                }, {
                    resource_id: 'Others',
                    group_name: 'Group Name',
                    name: 'Resource Name',
                    update_type: 'ADD',
                    tags: {
                        icon: 'http://',
                    },
                    count: 0,
                }]);
            }, 1000);
        });

        const getData = async () => {
            state.loading = true;
            state.data = await api();
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
            mapper: {
                key: 'resource_id',
                iconUrl: 'tags.icon',
                title: 'name',
                color(item) {
                    return colors[item.update_type];
                },
            },
            onSelected(item) {
                vm.$router.push('/identity/service-account');
            },
            stateIcons,
        };
    },
});
</script>

<style lang="postcss" scoped>
.daily-updates {
    min-width: 332px;
    max-width: 446px;
    overflow-y: auto;
}
.group-name {
    @apply text-base font-bold mb-1;
    font-family: theme('fontFamily.sans');
}
.name {
    @apply text-xs text-gray;
    font-family: theme('fontFamily.serif');
}
.count {
    @apply text-lg font-bold ml-1;
}
</style>

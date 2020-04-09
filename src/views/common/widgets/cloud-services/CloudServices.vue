<template>
    <p-widget-layout class="daily-updates" title="Cloud Services">
        <p-selectable-list class="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
                           :items="data" :mapper="mapper" theme="card"
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
                <span class="count">{{ item.count }}</span>
            </template>
        </p-selectable-list>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import { alert, safe, yellow } from '@/styles/colors';
import PBadge from '@/components/atoms/badges/Badge.vue';
import casual, { arrayOf } from '@/lib/casual';

export default defineComponent({
    name: 'CloudServices',
    components: {
        PWidgetLayout,
        PSelectableList,
        PBadge,
    },
    setup() {
        const vm: any = getCurrentInstance();


        const state: any = reactive({
            data: [],
            loading: true,
        });

        const api = async () => new Promise((resolve) => {
            setTimeout(() => {
                resolve(arrayOf(12, () => ({
                    // provider: string - provider store > icon
                    // group: string,
                    // name: string | undefined,
                    // tags: {
                    //     icon: 'http://', 비어있는 경우, provider icon 으로 대체
                    // },
                    // count: number
                    resource_id: casual._uuid(),
                    group_name: 'Group Name',
                    name: 'Resource Name',
                    tags: {
                        icon: 'http://',
                    },
                    count: casual.integer(0),
                })));
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
            },
            onSelected(item) {
                vm.$router.push('/identity/service-account');
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
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

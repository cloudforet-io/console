<template>
    <div class="project-search-widget">
        <p-toolbox :page-size="pageSize"
                   :total-count="totalCount"
                   @change="onChange"
                   @refresh="getData()"
        />
        <div class="box-group">
            <div class="box">
                <p class="sub-title">
                    Project Group
                </p>
                <p class="title">
                    Project Name
                </p>
                <p-list-card style-type="yellow100">
                    <template #header>
                        Maintenance Window
                    </template>
                    <template #item="{item, index}">
                        <alert-list-item :item="item" />
                    </template>
                </p-list-card>
                <p-list-card>
                    <template #header>
                        Open Alert (6)
                    </template>
                    <template #item="{item, index}">
                        <alert-list-item :item="item" />
                    </template>
                </p-list-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { range } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PToolbox, PListCard,
} from '@spaceone/design-system';
import AlertListItem from '@/views/monitoring/alert/components/AlertListItem.vue';

import { store } from '@/store';


export default {
    name: 'ProjectSearchWidget',
    components: {
        PToolbox,
        PListCard,
        AlertListItem,
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            pageStart: 1,
            pageSize: 24,
            totalCount: 0,
            items: [
                {
                    projectId: 'project-18655561c535',
                },
                {
                    projectId: 'project-2db511294a9d',
                },
                {
                    projectId: 'project-113c197ce1f2',
                },
                {
                    projectId: 'project-9074eea97d7e',
                },
            ],
        });

        /* api */
        const getData = async () => {
            //
        };

        /* event */
        const onChange = async (options: any) => {
            if (options.pageLimit !== undefined) {
                state.pageSize = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.pageStart = options.pageStart;
            }
            await getData();
        };

        return {
            ...toRefs(state),
            onChange,
            getData,
            range,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-search-widget {
    .p-toolbox::v-deep {
        .p-search {
            border-radius: 0.25rem;
        }
    }

    .box-group {
        @apply grid grid-cols-12;
        gap: 1rem;

        .box {
            @apply col-span-6 bg-white border border-gray-200 rounded-md;
            height: 20.375rem;
            box-sizing: border-box;
            box-shadow: 0 0.125rem 0.25rem rgba(theme('colors.black'), 0.06);
            padding: 1rem;

            .sub-title {
                @apply text-gray-500;
                line-height: 1.3;
                font-size: 0.75rem;
            }
            .title {
                line-height: 1.6;
                font-size: 1rem;
                font-weight: bold;
            }
            .p-list-card {
                margin-top: 0.75rem;
            }
        }
    }

    @screen tablet {
        .box-group {
            .box {
                height: 21.375rem;
            }
        }
    }

    @screen mobile {
        .box-group {
            .box {
                @apply col-span-12;
            }
        }
    }
}
</style>

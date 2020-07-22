<template>
    <general-page-layout class="h-screen">
        <HorizontalLayout>
            <template #container="{height}">
                <PPageTitle class="mt-4">
                    <template #title>
                        <i class="fas fa-database text-blue-400 " /> Query
                    </template>
                </PPageTitle>
                <p-pane-layout>
                    <PMonacoEditor :style="{height:height+'px'}"
                                   :code.sync="query"
                    />
                </p-pane-layout>
            </template>
        </HorizontalLayout>
        <PPageTitle class="mt-4">
            <template #title>
                <i class="fas fa-database text-blue-400 " /> Result
            </template>
        </PPageTitle>
        <p-pane-layout>
            <RawData :raw="raw" />
        </p-pane-layout>
    </general-page-layout>
</template>
<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/PMonacoEditor.vue';
import RawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import HorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import { parser } from '@/lib/api/code-generater';


const testSample = `
{
    "resource_type": "inventory.CloudServiceType",
    "query": {
        "aggregate": {
            "group": {
                "keys": [
                    {
                        "key": "cloud_service_type_id",
                        "name": "cloud_service_type_id"
                    },
                    {
                        "key": "name",
                        "name": "cloud_service_type"
                    },
                    {
                        "key": "group",
                        "name": "cloud_service_group"
                    },
                    {
                        "key": "provider",
                        "name": "provider"
                    }
                ]
            }
        },
        "sort": {
            "name": "cloud_service_count",
            "desc": true
        }
    },
    "join": [
        {
            "keys": [
                "cloud_service_type",
                "cloud_service_group",
                "provider"
            ],
            "resource_type": "inventory.CloudService",
            "query": {
                "aggregate": {
                    "group": {
                        "keys": [
                            {
                                "key": "cloud_service_type",
                                "name": "cloud_service_type"
                            },
                            {
                                "key": "cloud_service_group",
                                "name": "cloud_service_group"
                            },
                            {
                                "key": "provider",
                                "name": "provider"
                            }
                        ],
                        "fields": [
                            {
                                "operator": "count",
                                "name": "cloud_service_count"
                            }
                        ]
                    }
                }
            }
        },
        {
            "keys": [
                "cloud_service_type",
                "cloud_service_group",
                "provider"
            ],
            "resource_type": "inventory.CloudService",
            "query": {
                "filter": [
                    {
                        "key": "created_at",
                        "value": "now/d",
                        "operator": "timediff_gte"
                    }
                ],
                "aggregate": {
                    "group": {
                        "keys": [
                            {
                                "key": "cloud_service_type",
                                "name": "cloud_service_type"
                            },
                            {
                                "key": "cloud_service_group",
                                "name": "cloud_service_group"
                            },
                            {
                                "key": "provider",
                                "name": "provider"
                            }
                        ],
                        "fields": [
                            {
                                "operator": "count",
                                "name": "yesterday_cloud_service_count"
                            }
                        ]
                    }
                }
            }
        }
    ]
}`;
export default defineComponent({
    name: 'DynamicLayoutHelper',
    components: {
        PPaneLayout,
        GeneralPageLayout,
        PPageTitle,
        PMonacoEditor,
        RawData,
        HorizontalLayout,
    },
    setup() {
        const state = reactive({
            query: testSample,
            raw: computed(() => {
                try {
                    return parser(state.query);
                } catch (e) {
                    console.error(e);
                    return `Parsing Error!!\n${e}`;
                }
            }),

        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

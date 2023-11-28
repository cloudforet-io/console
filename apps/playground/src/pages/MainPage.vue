<script setup lang="ts">
import { computed, reactive } from 'vue';

import { get } from 'lodash';

import {
    PPaneLayout, PHeading, PDynamicLayout, PIconButton,
} from '@spaceone/design-system';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { SchemaType } from '@/lib/schema';
import { getSchema } from '@/lib/schema';
import { useResourceInputDataStore, useMetadataSchemaInputDataStore } from '@/stores/input-data-store';

import InputPanel from '@/components/InputPanel.vue';
import OutputPanel from '@/components/OutputPanel.vue';

const metadataSchemaStore = useMetadataSchemaInputDataStore();
const resourceStore = useResourceInputDataStore();

const state = reactive({
    schemaType: 'table' as SchemaType,
    schema: computed<DynamicLayout|null>(() => {
        const metadataSchema = metadataSchemaStore.state.parsedObject;
        if (!metadataSchema) return null;
        const schema = getSchema({
            metadataSchema,
        });
        console.debug('schema', schema);
        return schema;
    }),
    data: computed(() => {
        let data;
        if (state.schemaType === 'table') data = resourceStore.state.parsedObject;
        else data = metadataSchemaStore.state.parsedObject;

        if (Array.isArray(data)) {
            return data.map((item) => {
                if (get(item, 'data')) return item;
                return get(item, 'resource');
            });
        }
        if (get(data, 'data')) return data;
        return get(data, 'resource');
    }),
});


</script>

<template>
    <div class="main-page">
        <p-heading>Playground</p-heading>
        <div class="page-contents">
            <section>
                <p-heading heading-type="sub">
                    Inputs
                    <template #title-right-extra>
                        <p-icon-button class="heading-collapse-button"
                                       name="ic_chevron-down"
                        />
                    </template>
                </p-heading>
                <input-panel />
            </section>
            <section>
                <p-heading heading-type="sub">
                    Outputs
                    <template #title-right-extra>
                        <p-icon-button class="heading-collapse-button"
                                       name="ic_chevron-down"
                        />
                    </template>
                </p-heading>
                <output-panel :schema="state.schema"
                              :data="state.data"
                />
            </section>
            <section>
                <div class="input-section">
                    <p-heading heading-type="sub">
                        Dynamic UI
                    </p-heading>
                    <p-pane-layout class="dynamic-ui-wrapper">
                        <p-dynamic-layout v-if="state.schema"
                                          :name="state.schema?.name"
                                          :type="state.schema?.type"
                                          :options="state.schema?.options ?? {}"
                                          :data="state.data"
                        />
                    </p-pane-layout>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.main-page {
    padding: 2rem;
    .page-contents {
        .heading-collapse-button {
            display: inline;
        }
    }
    .dynamic-ui-wrapper {
        padding: 1rem;
    }
}
</style>

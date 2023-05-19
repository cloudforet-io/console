<template>
    <p-pane-layout>
        <p-heading :title="i18n.t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_OPTIONS')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ i18n.t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

import { PHeading, PButton, PPaneLayout } from '@spaceone/design-system';

import { i18n } from '@/translations';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
const props = defineProps<{}>();

</script>

<script setup lang="ts">

import { PDataLoader } from '@spaceone/design-system';

import type { Currency } from '@/store/modules/settings/type';

import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';


interface Props {
  loading: boolean;
  fields: TableWidgetField[];
  items?: any[];
  currency?: Currency;
  size?: WidgetSize;
  widgetId: string;
}
const props = defineProps<Props>();

</script>

<template>
    <div class="widget-data-table">
        <p-data-loader class="table-container"
                       :loading="props.loading"
                       :data="props.items"
                       :loader-backdrop-opacity="1"
                       disable-empty-case
        >
            <template #default>
                <table ref="tableRef">
                    <thead>
                        <tr>
                            <th v-for="(field, fieldColIndex) in props.fields"
                                :key="`th-${props.widgetId}-${fieldColIndex}`"
                                :style="{
                                    minWidth: field.width || undefined,
                                    width: field.width || undefined,
                                }"
                            >
                                <span class="th-contents"
                                      :class="{
                                          'has-icon': field.tooltipText,
                                      }"
                                >
                                    <span class="th-text">
                                        {{ field.label ? field.label : field.name }}
                                    </span>
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody ref="tbodyRef">
                        <tr v-for="(item, rowIndex) in props.items"
                            :key="`tr-${props.widgetId}-${rowIndex}`"
                            :data-index="rowIndex"
                        >
                            <td v-for="(field, colIndex) in props.fields"
                                :key="`td-${props.widgetId}-${rowIndex}-${colIndex}`"
                                :class="{
                                    [props.size]: true,
                                    'link-item': field?.link,
                                }"
                            >
                                <div class="detail-item-wrapper">
                                    <span ref="labelRef"
                                          class="td-contents"
                                    >
                                        <span class="common-text-box">{{ field }}</span>
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </template>
        </p-data-loader>
    </div>
</template>

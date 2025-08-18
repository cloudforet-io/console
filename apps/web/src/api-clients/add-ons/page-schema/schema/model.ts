import type { DynamicLayout } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';

export interface PageSchemaModel extends DynamicLayout {
    details?: DynamicLayout[]; // schema: 'details'
}

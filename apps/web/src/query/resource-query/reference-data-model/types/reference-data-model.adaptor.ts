import type { ReferenceItem } from '@/query/resource-query/reference-data-model/types/reference-type';

export type ReferenceDataModelImplementationAdaptor<R extends ReferenceItem> = () => { map: Record<string, R|undefined> };

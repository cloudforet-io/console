import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type WebhookReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type WebhookReferenceMap = ReferenceMap<WebhookReferenceItem>;

export interface WebhookReferenceState {
    items?: WebhookReferenceMap;
}

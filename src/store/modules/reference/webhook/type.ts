import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type WebhookReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'>>

export type WebhookReferenceMap = ReferenceMap<WebhookReferenceItem>

export type WebhookReferenceState = ReferenceState<WebhookReferenceMap>

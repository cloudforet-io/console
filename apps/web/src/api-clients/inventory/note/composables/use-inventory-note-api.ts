
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NoteCreateParameters } from '@/api-clients/inventory/note/schema/api-verbs/create';
import type { NoteDeleteParameters } from '@/api-clients/inventory/note/schema/api-verbs/delete';
import type { NoteListParameters } from '@/api-clients/inventory/note/schema/api-verbs/list';
import type { NoteUpdateParameters } from '@/api-clients/inventory/note/schema/api-verbs/update';
import type { NoteModel } from '@/api-clients/inventory/note/schema/model';

export const useInventoryNoteApi = () => {
    const actions = {
        list: SpaceConnector.clientV2.inventory.note.list<NoteListParameters, ListResponse<NoteModel>>,
        create: SpaceConnector.clientV2.inventory.note.create<NoteCreateParameters, NoteModel>,
        delete: SpaceConnector.clientV2.inventory.note.delete<NoteDeleteParameters>,
        update: SpaceConnector.clientV2.inventory.note.update<NoteUpdateParameters, NoteModel>,
    };
    return {
        noteAPI: actions,
    };
};

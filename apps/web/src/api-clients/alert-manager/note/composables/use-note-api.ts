import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NoteCreateParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/create';
import type { NoteDeleteParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/delete';
import type { NoteGetParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/get';
import type { NoteListParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/list';
import type { NoteUpdateParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/update';
import type { NoteModel } from '@/api-clients/alert-manager/note/schema/model';

export const useNoteApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.note.create<NoteCreateParameters, NoteModel>,
        delete: SpaceConnector.clientV2.alertManager.note.delete<NoteDeleteParameters>,
        get: SpaceConnector.clientV2.alertManager.note.get<NoteGetParameters, NoteModel>,
        list: SpaceConnector.clientV2.alertManager.note.list<NoteListParameters, ListResponse<NoteModel>>,
        update: SpaceConnector.clientV2.alertManager.note.update<NoteUpdateParameters, NoteModel>,
    };

    return {
        noteAPI: actions,
    };
};


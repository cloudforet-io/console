import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PostCreateParameters } from '@/api-clients/board/post/schema/api-verbs/create';
import type { PostDeleteParameters } from '@/api-clients/board/post/schema/api-verbs/delete';
import type { PostGetParameters } from '@/api-clients/board/post/schema/api-verbs/get';
import type { PostListParameters } from '@/api-clients/board/post/schema/api-verbs/list';
import type { PostSendParameters } from '@/api-clients/board/post/schema/api-verbs/send';
import type { PostUpdateParameters } from '@/api-clients/board/post/schema/api-verbs/update';
import type { PostModel } from '@/api-clients/board/post/schema/model';


export const usePostApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.board.post.create<PostCreateParameters, PostModel>,
        delete: SpaceConnector.clientV2.board.post.delete<PostDeleteParameters, PostModel>,
        get: SpaceConnector.clientV2.board.post.get<PostGetParameters, PostModel>,
        list: SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>,
        send: SpaceConnector.clientV2.board.post.send<PostSendParameters, PostModel>,
        update: SpaceConnector.clientV2.board.post.update<PostUpdateParameters, PostModel>,
    };

    return {
        postAPI: actions,
    };
};


import { GetAction, Resource, ResourceActions } from '@/lib/fluent-api';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GetParameter {
    aggregate: string[];
}
class Get extends GetAction<GetParameter, any> {

}

export default class Server extends Resource implements ResourceActions<'diff' | 'count'> {
    name: 'server'

}

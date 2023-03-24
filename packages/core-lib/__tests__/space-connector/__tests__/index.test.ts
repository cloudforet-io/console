import { SpaceConnector } from '@/space-connector';
import TokenAPI from '@/space-connector/token-api';

describe('SpaceConnector', () => {
    const endpoints = ['https://localhost:3000', 'https://localhost:3001'];
    const tokenApi = new TokenAPI(endpoints[0], () => { console.log('session expired!'); });
    test('init SpaceConnector', () => {
        SpaceConnector.init(endpoints, tokenApi);
        expect(typeof SpaceConnector.client).toBe('object');
    });
});

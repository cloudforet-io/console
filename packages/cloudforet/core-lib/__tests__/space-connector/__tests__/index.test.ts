import { SpaceConnector } from '@/space-connector';

describe('SpaceConnector', () => {
    const endpoint = 'https://localhost:3000';

    test('init SpaceConnector', () => {
        SpaceConnector.init(endpoint);
        expect(typeof SpaceConnector.client).toBe('object');
    });
});

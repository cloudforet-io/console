import {
    describe, it, expect, vi,
} from 'vitest';

import { createEventEmitter } from '@/query/resource-query/reference-model/utils/create-event-emitter';


const MOCK_EVENT_KEY = Symbol('mock-event');


describe('createEventEmitter', () => {
    it('should receive event that is emitted by the emitter, if listener is registered by on method', () => {
        const emitter = createEventEmitter();
        const mockListener = vi.fn();

        emitter.on(MOCK_EVENT_KEY, mockListener);

        emitter.emit(MOCK_EVENT_KEY, 'test');

        expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('should deliver arguments delivered by emitter to the listener', () => {
        const emitter = createEventEmitter();
        const mockListener = vi.fn();

        emitter.on(MOCK_EVENT_KEY, mockListener);

        emitter.emit(MOCK_EVENT_KEY, 'test', 'test2');

        expect(mockListener).toHaveBeenCalledTimes(1);
        expect(mockListener).toHaveBeenCalledWith('test', 'test2');
    });


    it('should call all listeners that are registered to the same event', () => {
        const emitter = createEventEmitter();
        const mockListener1 = vi.fn();
        const mockListener2 = vi.fn();

        emitter.on(MOCK_EVENT_KEY, mockListener1);
        emitter.on(MOCK_EVENT_KEY, mockListener2);

        emitter.emit(MOCK_EVENT_KEY, 'test');

        expect(mockListener1).toHaveBeenCalledTimes(1);
        expect(mockListener1).toHaveBeenCalledWith('test');
        expect(mockListener2).toHaveBeenCalledTimes(1);
        expect(mockListener2).toHaveBeenCalledWith('test');
    });

    it('should not call listener that is removed by off method', () => {
        const emitter = createEventEmitter();
        const mockListener1 = vi.fn();
        const mockListener2 = vi.fn();

        emitter.on(MOCK_EVENT_KEY, mockListener1);
        emitter.on(MOCK_EVENT_KEY, mockListener2);

        emitter.off(MOCK_EVENT_KEY, mockListener1);

        emitter.emit(MOCK_EVENT_KEY, 'test');

        expect(mockListener1).not.toHaveBeenCalled();
        expect(mockListener2).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when emitting event that has no listeners', () => {
        const emitter = createEventEmitter();

        expect(() => emitter.emit(MOCK_EVENT_KEY, 'test')).not.toThrow();
    });
});

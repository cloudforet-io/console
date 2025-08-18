import {
    describe, it, expect, vi,
} from 'vitest';

import IdBatcher from '@/query/resource-query/reference-data-model/core/id-batcher';

describe('IdBatcher', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockOnBatchReady = vi.fn();

    it('should call onBatchReady immediately, when batch size is reached', () => {
        const idBatcher = new IdBatcher(mockOnBatchReady, {
            batchSize: 5,
        });

        idBatcher.enqueue('1');
        idBatcher.enqueue('2');
        idBatcher.enqueue('3');
        idBatcher.enqueue('4');
        idBatcher.enqueue('5');

        expect(mockOnBatchReady).toHaveBeenCalledWith(['1', '2', '3', '4', '5']);
    });

    it('should call onBatchReady after debounce time', async () => {
        const idBatcher = new IdBatcher(mockOnBatchReady, {
            debounceMs: 500,
        });

        idBatcher.enqueue('1');
        idBatcher.enqueue('2');
        idBatcher.enqueue('3');

        expect(mockOnBatchReady).not.toHaveBeenCalled();

        await vi.advanceTimersByTime(500);

        expect(mockOnBatchReady).toHaveBeenCalledTimes(1);
        expect(mockOnBatchReady).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('should call onBatchReady once, although same id is enqueued multiple times', async () => {
        const idBatcher = new IdBatcher(mockOnBatchReady, {
            debounceMs: 500,
        });

        idBatcher.enqueue('1');
        idBatcher.enqueue('1');
        idBatcher.enqueue('1');
        idBatcher.enqueue('2');
        idBatcher.enqueue('2');

        await vi.advanceTimersByTime(500);

        expect(mockOnBatchReady).toHaveBeenCalledTimes(1);
        expect(mockOnBatchReady).toHaveBeenCalledWith(['1', '2']);
    });
});

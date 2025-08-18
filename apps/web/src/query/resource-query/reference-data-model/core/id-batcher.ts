interface IdBatcherOptions {
    batchSize?: number;
    debounceMs?: number;
    maxBatchSize?: number;
}

class IdBatcher {
    private BATCH_SIZE = 15;

    private DEBOUNCE_MS = 300;

    private MAX_BATCH_SIZE = 45;

    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    private pendingSet = new Set<string>();

    private onBatchReady: (ids: string[]) => Promise<any>;

    constructor(onBatchReady: (ids: string[]) => Promise<void>, options: IdBatcherOptions = {}) {
        this.onBatchReady = onBatchReady;
        this.BATCH_SIZE = options.batchSize ?? this.BATCH_SIZE;
        this.DEBOUNCE_MS = options.debounceMs ?? this.DEBOUNCE_MS;
        this.MAX_BATCH_SIZE = options.maxBatchSize ?? this.MAX_BATCH_SIZE;
    }

    enqueue(id: string) {
        if (!id || this.pendingSet.has(id)) return;

        this.pendingSet.add(id);

        if (this.pendingSet.size >= this.BATCH_SIZE) {
            this.processBatch();
        } else {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.processBatch();
            }, this.DEBOUNCE_MS);
        }
    }

    private async processBatch() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        const idsToProcess = Array.from(this.pendingSet);
        this.pendingSet.clear();
        if (idsToProcess.length === 0) return;

        await this.onBatchReady(idsToProcess);
    }
}

export default IdBatcher;

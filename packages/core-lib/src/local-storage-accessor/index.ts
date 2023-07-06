type ItemType = string | number | boolean | object | null;

export class LocalStorageAccessor {
    private static storage: Storage = window.localStorage;

    static getItem(key: string, disableParse = false) {
        const item = this.storage.getItem(key);
        if (disableParse) {
            return item;
        }
        try {
            return item ? JSON.parse(item) : null;
        } catch {
            return item;
        }
    }

    static setItem(key: string, value: ItemType): void {
        switch (typeof value) {
        case 'string':
            this.storage.setItem(key, value);
            break;
        default:
            this.storage.setItem(key, JSON.stringify(value));
        }
    }


    static removeItem(key: string): void {
        this.storage.removeItem(key);
    }

    static clear(): void {
        this.storage.clear();
    }
}

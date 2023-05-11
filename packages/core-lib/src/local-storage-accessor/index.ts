type ItemType = string | number | boolean | object | null;

export class LocalStorageAccessor {
    private static storage: Storage;

    static init(): void {
        LocalStorageAccessor.storage = window.localStorage;
    }

    static getItem(key: string, itemType?: ItemType) {
        const item = this.storage.getItem(key);
        if (itemType === 'number') {
            return Number(item);
        } if (itemType === 'boolean') {
            return Boolean(item);
        } if (itemType === 'object') {
            try {
                return item ? JSON.parse(item) : {};
            } catch {
                return {};
            }
        }
        return item;
    }

    static setItem(key: string, value: ItemType): void {
        switch (typeof value) {
        case 'object':
            this.storage.setItem(key, JSON.stringify(value));
            break;
        case 'boolean':
        case 'number':
            this.storage.setItem(key, String(value));
            break;
        default:
            this.storage.setItem(key, value);
            break;
        }
    }


    static removeItem(key: string): void {
        this.storage.removeItem(key);
    }

    static clear(): void {
        this.storage.clear();
    }
}

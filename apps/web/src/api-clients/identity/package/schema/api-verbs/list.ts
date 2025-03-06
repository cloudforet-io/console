import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface PackageListParameters {
    query?: Query;
    package_id?: string;
    name?: string;
}

# API Query Key Composable

## Overview
`useAPIQueryKey` is a composable for generating query keys for API requests. It integrates with Tanstack Query's caching system to provide a consistent query key structure.

## Basic Key Structure
The query key array follows a strict order to ensure consistent caching and invalidation patterns. The order is guaranteed to be:

1. App Context (workspace/admin context)
2. Service Name 
3. Resource Name
4. Verb
5. Resource ID (if applicable)
6. Request Parameters
7. Dependencies (if applicable)

This predictable structure allows for precise cache management and query invalidation at any level of the hierarchy.

```typescript
[
    ...appContext,  // ['workspace', 'workspaceId'] or ['admin']
    service,          // service name (e.g., 'dashboard', 'opsflow')
    resource,         // resource name (e.g., 'public-data-table')
    verb,            // action (e.g., 'get', 'list', 'load')
    id?,             // (optional) resource identifier (with 'get' verb)
    params?,         // (optional) request parameters
    deps?            // (optional) dependencies
]
```

## Key Options Interface

```typescript
interface UseAPIQueryKeyOptions<P extends object> {
  id?: _MaybeRefOrGetter<string>;
  params?: _MaybeRefOrGetter<P>;
  deps?: _MaybeRefOrGetter<object>;
}
```

## Return Value

```typescript
interface UseAPIQueryKeyResult<P> {
  key: ComputedRef<QueryKeyArray>;    // full query key
  namespaces: ComputedRef<QueryKeyArray>; // hierarchical structure for cache management
  params?: ComputedRef<P>;            // parameters
  deps?: ComputedRef<object>;        // dependencies (optional)
  id?: ComputedRef<string>;          // ID (optional)
}
```



## Usage

### Basic Usage
```typescript
const { key } = useAPIQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed(() => ({ page: 1, limit: 10 })), 
    }
);
```

### With ID
```typescript
const { key } = useAPIQueryKey(
    'dashboard',
    'public-data-table',
    'get',
    {
        id: toRef(state, 'currentDataTableId'),
        params: computed(() => ({ data_table_id: 'table-123' })), 
    }
);
```

### With Dependencies
```typescript
const { key } = _useAPIQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed(() => ({ page: 1, limit: 10 }),
        deps: computed(() => ({ filter: 'active' }),
    }
);
```

### With useQuery
```typescript
const { key, params } = _useAPIQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed<PublicDataTableListParams>(() => state.params)
    }
);

const { data } = useQuery({
  queryKey: key,
  queryFn: () => publicDataTableAPI.list(params.value)
});
```

### Cache Invalidation
```typescript
const { key, namespaces, params } = _useAPIQueryKey(
    'dashboard',
    'public-data-table',
    'get',
    {
        id: toRef(state, 'currentDataTableId')
        params: computed<PublicDataTableListParams>(() => state.params)
        deps: computed(() => ({ filter: 'active' }),
    }
);

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: key.value });

// Invalidate all queries under a namespace
queryClient.invalidateQueries({ queryKey: [...namespaces.value, state.currentDataTableId] });
```

### Best Practices
1. Always type your params interface for better type safety
2. Use the returned `params` in your `queryFn` to maintain consistency
3. Leverage TypeScript's type inference for better development experience
4. Consider using `deps` for values that should trigger cache invalidation but aren't part of the API request
5. Use `namespaces` for hierarchical cache invalidation when needed


## Maintenance Guide

### Type Definitions
- `ServiceName`: Available service names
- `ResourceName<S>`: Available resource names per service
- `Verb<S, R>`: Available actions for service and resource

### Development Environment Validation
- Runtime validation only in development environment
- Validation for required parameters, types, and structure
- Debugging support through warning messages

### Testing
- Snapshot tests for query key structure validation
- Test cases for various usage scenarios
- Tests for reactive values and function getters

## Important Notes
1. Query keys must maintain immutability.
2. Object parameters are automatically converted to immutable objects.
3. Runtime validation only runs in development environment.
4. Option object key order does not affect the result.

## References
- Integrates with Tanstack Query's caching system
- Supports Vue's reactivity system
- Ensures TypeScript type safety
- Provides logging for debugging in development environment

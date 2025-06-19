# Service Query Key Composable
A unified composable for generating structured query keys for TanStack Query in Vue + TypeScript apps.

## Overview
`useServiceQueryKey` is a composable for generating query keys for API requests. It integrates with Tanstack Query's caching system to provide a consistent query key structure.

## Basic Key Structure
The query key array follows a strict order to ensure consistent caching and invalidation patterns. The order is guaranteed to be:

1. App Context (workspace/admin context)
2. Service Name 
3. Resource Name
4. Verb
5. Context Key (if applicable)
   - Used to differentiate queries with the same service/resource/verb/params but different UI or logical context  
   - Example: same API called with different favorite types, themes, or view states
6. Request Parameters

This predictable structure allows for precise cache management and query invalidation at any level of the hierarchy.

```typescript
[
    ...appContext,     // ['workspace', 'workspaceId'] or ['admin']
    service,          // service name (e.g., 'dashboard', 'opsflow')
    resource,         // resource name (e.g., 'public-data-table')
    verb,            // action (e.g., 'get', 'list', 'load')
    contextKey?,     // (optional) contextual data (string, array, or object)
    params?          // (optional) request parameters
]
```

## Key Options Interface

```typescript
interface UseServiceQueryKeyOptions<T extends object> {
  contextKey?: _MaybeRefOrGetter<ContextKeyType>;  // string | unknown[] | object
  params?: _MaybeRefOrGetter<T>;
}
```

## Return Value

```typescript
interface UseServiceQueryKeyResult<T> {
  key: ComputedRef<QueryKeyArray>;    // full query key
  params: ComputedRef<T>;            // parameters
  withSuffix: (arg: ContextKeyType) => QueryKeyArray;  // dynamic namespace builder
}
```

## Query Key Management

### Importance of Key Structure
The query key structure is carefully designed to ensure consistent cache management. It should be used as-is without modification.

### Correct Usage Pattern
```typescript
// ✅ Recommended: Using key as-is
const { key, params } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed(() => ({ page: 1, limit: 10 }))
    }
);

const { data } = useQuery({
    queryKey: key,  // Use the key directly
    queryFn: () => publicDataTableAPI.list(params)
});

// ❌ Not Recommended: Modifying query key structure
const { data } = useQuery({
    queryKey: [...key.value, 'additional', 'parts'],  // Avoid modifying the key structure
    queryFn: () => publicDataTableAPI.list(params)
});
```

### Why This Matters
1. **Cache Consistency**: Modifying the key structure can lead to cache misses or invalid cache entries
2. **Cache Invalidation**: Proper cache invalidation relies on consistent key structure
3. **Predictability**: The predefined structure ensures predictable cache behavior

### Best Practices
1. Always use the `key` returned from `useServiceQueryKey` without modification
2. Use `withSuffix` for dynamic namespace creation instead of modifying the key structure
3. Maintain the predefined key structure for consistent cache management

## Usage

### Basic Usage
```typescript
const { key } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed(() => ({ page: 1, limit: 10 })), 
    }
);

// Key Result : ['workspace', 'workspace-123', 'dashboard', 'public-data-table', 'list', { page: 1, limit: 10 }]
```

### With Context Key
```typescript
const { key } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'get',
    {
        contextKey: computed(() => state.dataTableId),
        params: computed(() => ({ page: 1, limit: 10 })), 
    }
);

// Key Result : ['workspace', 'workspace-123', 'dashboard', 'public-data-table', 'get', 'table-123', { page: 1, limit: 10 }]
```

### With useQuery
```typescript
const { key, params } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed<PublicDataTableListParams>(() => state.params)
    }
);

const { data } = useQuery({
  queryKey: key,
  queryFn: () => publicDataTableAPI.list(params)
});

// Key Result : ['workspace', 'workspace-123', 'dashboard', 'public-data-table', 'list', { page: 1, limit: 10 }]
// Params Result : { page: 1, limit: 10 } (ComputedRef Value)
```

## Query Parameters Management

### Importance of params
The `params` returned from `useServiceQueryKey` is crucial for maintaining consistent cache management. It should always be used as the parameters for the `queryFn` to ensure proper cache key generation and invalidation.

### Correct Usage Pattern
```typescript
// ✅ Recommended: Using params from useServiceQueryKey
const { key, params } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'list',
    {
        params: computed<PublicDataTableListParams>(() => ({ page: 1, limit: 10 }))
    }
);

// ✅ Use params from useServiceQueryKey
const { data } = useQuery({
    queryKey: key,
    queryFn: () => publicDataTableAPI.list(params.value)
});

// ❌ Not Recommended: Creating params separately
const { data } = useQuery({
    queryKey: key,
    queryFn: () => publicDataTableAPI.list({ page: 1, limit: 10 })  // Avoid creating params separately
});
```

### Why This Matters
1. **Cache Consistency**: Using the same params object ensures that the cache key matches the actual API request parameters
2. **Cache Invalidation**: Proper cache invalidation relies on consistent parameter handling
3. **Type Safety**: The params object maintains type safety throughout the query lifecycle

### Best Practices
1. Always use the `params` returned from `useServiceQueryKey` in your `queryFn`
2. Maintain type safety by properly typing your params

## Dynamic Namespace with withSuffix

`withSuffix` is a method designed for imperative cache invalidation scenarios, particularly useful when you need to create dynamic query key namespaces that weren't available at the declaration time.

### Key vs withSuffix

| Purpose                  | Method       | Example                                                | When to Use                                   |
|--------------------------|--------------|--------------------------------------------------------|------------------------------------------------|
| Declarative data fetch   | `key`        | `useQuery({ queryKey: key })`                          | During component setup or reactive queries     |
| Contextual invalidation  | `withSuffix` | `queryClient.invalidateQueries({ queryKey: withSuffix(id) })` | When additional runtime context is needed |

- `key` is used for declarative data fetching and most standard cache invalidations.
- `withSuffix` should be used **only when additional dynamic context (like an ID or variant) is needed** at runtime for imperative cache control.
- It is not required for every cache invalidation — use it selectively.
- Avoid modifying the `key` manually; prefer `withSuffix` when runtime extensions are necessary.

### Use Cases
1. Cache invalidation in mutation callbacks
2. Dynamic namespace creation in imperative code
3. Context-specific cache management

### Example
```typescript
// In use-data-table-cascade-update.ts
const { withSuffix } = useServiceQueryKey(
    'dashboard',
    'public-data-table',
    'load'
);

// Dynamic cache invalidation based on data table type
const _invalidateLoadQueries = async (data: DataTableModel) => {
    await queryClient.invalidateQueries({
        queryKey: withSuffix(data.data_table_id), // ['admin', 'dashboard', 'public-dashboard', 'load', 'dt-123']
    });
};
```

### Benefits
1. **Imperative Cache Control**: Aligns with Tanstack Query's imperative invalidation philosophy
2. **Dynamic Context**: Allows creation of context-specific namespaces at runtime
3. **Type Safety**: Maintains type safety while providing flexibility
4. **Performance**: Includes built-in caching for object-based suffixes

### Best Practices
1. Use `withSuffix` primarily for cache invalidation scenarios
2. Leverage object caching for frequently used suffixes
3. Consider the performance implications of suffix caching
4. Use type-safe context keys when possible

## Maintenance Guide

### Type Definitions
- `ServiceName`: Available service names
- `ResourceName<S>`: Available resource names per service
- `Verb<S, R>`: Available actions for service and resource
- `ContextKeyType`: string | unknown[] | object

### Development Environment Validation
- Runtime validation only in development environment
- Validation for required parameters and types
- Debugging support through warning messages

## Important Notes
1. Query keys must maintain immutability
2. Object parameters are automatically converted to immutable objects
3. Runtime validation only runs in development environment
4. Option object key order does not affect the result
5. `withSuffix` results are cached for object-based suffixes

## References
- Integrates with Tanstack Query's caching system
- Supports Vue's reactivity system
- Ensures TypeScript type safety
- Provides logging for debugging in development environment

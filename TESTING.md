
# Testing Result

### Environments
- NodeJS = v24.22.3
- NPM = 11.19.1
- CPU = i7-12700H Laptop 14 Core
- Memory = 32GB DDR5
- Database = MySQL default config with replica
- Service = NestJS rest api

## Commerce API

### Get Product API

#### Performance Testing

Testing held by running the performance test script, the result is collected through the k6 result and .csv monitoring result

1. Spike Testing 2m Spike up-to 2K VU, down to 0 in 1m

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | ok | 0% | 41.34ms | 1.07s | 242.6ms | 961.36 | 11.86% | 74.88MB |
| 2 | ok | 0% | 17.27ms | 142.74ms | 88.2ms | 984.48 | 30.88% | 73.11MB |
| 3 | not ok | 0% | 62.68ms | 1.01s | 360.28ms | 942.18 | 48.55% | 93.04MB |
| 4 | ok | 0% | 33.51ms | 762.43ms | 195.36ms | 967.90 | 66.61% | 76.37MB |

Found p95 spike on attempt 3

2. Stress Testing 2m30s Load up-to 5K VU, down to 0 in 20s

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | not ok | 0% | 1.17s | 4s | 2.2s | 1470.99 | 15.75% | 202.92MB |
| 2 | ok | 0% | 25.19ms | 352.85ms | 162.19ms | 3103.78 | 19.83% | 142.71MB |

p95 still below 300ms on attempt 2, i'd like to focus on place order implementation first for now

#### Optimization Attempt

1. Database Bottleneck detected

during stress test attempt 1, p95 hit 2.2s which reached the threshold 300ms

i check whether the database or the service is the bottleneck by mocking the repo result with static object, turns out when i return static object, i got p95 1.04ms.
i increased the default mysqld `max_connections` from `151` into `300` because when i checked there're more than 100 sleep or idle connection, but it doesn't help either p95 still 2.61s rps doesn't decrease either.

i added 2 database replica syncing to 1 primary database, and put 3 of them behind a proxy and separated between the primary dan secondary as follow:
- primary: localhost:3300 -> haproxy -> 172.20.0.11:3311
- secondary: localhost:3301 -> haproxy -> 172.20.0.12:3312 (weight: 5), 172.20.0.13:3313 (weight: 5), 172.20.0.11:3311 (weight: 1)

the result is attempt 2, p95 reduced to `162.19ms` and rps increased to `3103.78`

it's seems the default database config did not allow us to run with performance mode, there is room for tweaking the database, but for now let's assume it's the max resource we can get by using the default config.

### Place Order API

#### Performance Testing

Testing held by running the performance test script, the result is collected through the k6 result and .csv monitoring result

1. Smoke Testing 30s up-to 5 VU

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | ok | 0% | 13.24ms | 33.36ms | 242.6ms | 3.02 | 51.97% | 95.47MB |

100 qty, There's no over-sell

2. Spike Testing 2m Spike up-to 2K VU, down to 0 in 1m

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | not ok | 8% | 8.57s | 28.19s | 4.81s | 250.80 | 60.09% | 168.07MB |
| 2 | not ok | 7% | 1.61s | 28.38s | 2.2s | 383.31 | 86.74% | 188.02MB |

5000 qty, There's no over-sell, found p95 spike on attempt 1

#### Optimization Attempt

1. Database Bottleneck detected

during spike test attempt 1, p95 reached 4.81s, and system is only able to hit 250rps.
i found out bottleneck happened due to pessimistic locking applied on place order repo

```ts
  const product = await manager.findOne(Product, {
    where: {
      unique_id: p.item.product_id,
      available_quantity: MoreThanOrEqual(p.item.quantity),
    },
    lock: {
      mode: 'pessimistic_write'
    }
  });
  if (!product) {
    throw new Status(StatusCode.VALIDATION_INVALID_STATE, 'unsufficient product stock')
  }

  await manager.decrement(
    Product, { id: product.id },
    'available_quantity', p.item.quantity,
  );
  
```

i removed the lock and put an atomic update instead

```ts
  const decRes = await manager.decrement(
    Product,
    {
      unique_id: p.item.product_id,
      available_quantity: MoreThanOrEqual(p.item.quantity),
    },
    'available_quantity',
    p.item.quantity,
  );
  if (decRes.affected === 0) {
    throw new Status(
      StatusCode.VALIDATION_INVALID_STATE,
      'insufficient product stock',
    );
  }
```

p95 reduced to `2.2s` and rps increased to `383.31`


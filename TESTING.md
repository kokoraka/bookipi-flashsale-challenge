
# Testing Result

### Environments
- NodeJS = v24.22.3
- NPM = 11.19.1
- CPU = i7-12700H Laptop 14 Core
- Memory = 32GB DDR5
- Database = MySQL default config no replica
- Service = NestJS rest api

## Commerce API

### Performance Testing

Testing held by running the performance test script, the result is collected through the k6 result and .csv monitoring result

1. Spike Testing 2m Spike up-to 2K VU, down to 0 in 1m

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | ok | 0% | 41.34ms | 1.07s | 242.6ms | 961.36 | 11.86% | 74.88MB |
| 2 | ok | 0% | 17.27ms | 142.74ms | 88.2ms | 984.48 | 30.88% | 73.11MB |
| 3 | not ok | 0% | 62.68ms | 1.01s | 360.28ms | 942.18 | 48.55% | 93.04MB |
| 4 | ok | 0% | 33.51ms | 762.43ms | 195.36ms | 967.90 | 66.61% | 76.37MB |

2. Stress Testing 2m30s Load up-to 5K VU, down to 0 in 20s

| attempt | result | req failed | avg duration | max duration| p95(<300ms) | rps | avg node cpu usage | avg node ram usage | avg db ram usage |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | not ok | 0% | 1.17s | 4s | 2.2s | 1470.99 | 15.75% | 202.92MB | 21.17MB | 

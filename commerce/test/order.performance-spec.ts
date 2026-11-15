import http from 'k6/http';
import { check, sleep } from 'k6';
import faker from 'k6/x/faker';
// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  scenarios: {
    smoke: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 3 },
        { duration: '25s', target: 5 },
      ],
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 2000 }, // traffic ramp-up from 1 to a higher 2000 users over 20s.
        { duration: '30s', target: 3000 }, // ram-up at higher 3000 users for 30s
        { duration: '40s', target: 4000 }, // ram-up at higher 4000 users for 40s
        { duration: '50s', target: 5000 }, // ram-up at higher 5000 users for 50s
        { duration: '20s', target: 0 }, // ramp-down to 0 users
      ],
    },
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 2000 }, // fast ramp-up to a high point
        { duration: '1m', target: 0 }, // quick ramp-down to 0 users
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

function testPlaceOrder() {
  const host = 'http://localhost:4001';
  const productId = '01a1dd34-b2fc-7fa1-b7e1-b98267225dfa';
  const quantity = '1';
  const idempotencyKey = uuidv4()

  const res = http.post(`${host}/v1/orders`, {
    name: faker.person.name(),
    email: faker.person.email(),
    item_id: productId,
    quantity
  }, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });

  check(res, {
    'status code success': (r) => r.status == 201 || r.status == 200,
  });
  sleep(1);
}

export default function () {
  testPlaceOrder();
}

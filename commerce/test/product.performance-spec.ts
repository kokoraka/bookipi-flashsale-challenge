import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    smoke: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 3 },
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
    stress2: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 4000 }, // traffic ramp-up from 1 to a higher 2000 users over 20s.
        { duration: '30s', target: 6000 }, // ram-up at higher 3000 users for 30s
        { duration: '40s', target: 8000 }, // ram-up at higher 4000 users for 40s
        { duration: '50s', target: 10000 }, // ram-up at higher 5000 users for 50s
        { duration: '20s', target: 0 }, // ramp-down to 0 users
      ],
    },
    stress3: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 40000 }, // traffic ramp-up from 1 to a higher 2000 users over 20s.
        { duration: '30s', target: 60000 }, // ram-up at higher 3000 users for 30s
        { duration: '40s', target: 80000 }, // ram-up at higher 4000 users for 40s
        { duration: '50s', target: 100000 }, // ram-up at higher 5000 users for 50s
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
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

function testGetProductById() {
  const host = 'http://localhost:4001';
  const productId = '01a1dd34-b2fc-7fa1-b7e1-b98267225dfa';
  const res = http.get(`${host}/v1/flashsale/products/${productId}`, {
    headers: {
      Connection: 'keep-alive',
    }
  });

  check(res, {
    'status code 200': (r) => r.status == 200,
  });
  sleep(1);
}

export default function () {
  testGetProductById();
}

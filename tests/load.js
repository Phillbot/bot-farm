import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50000 }, // Ramp-up to 50 users
    { duration: '1m', target: 35000 }, // Stay at 50 users
    { duration: '30s', target: 0 }, // Ramp-down to 0 users
  ],
};

export default function () {
  http.get('http://localhost:8080/react-clicker-bot/getMe');
  sleep(1);
}

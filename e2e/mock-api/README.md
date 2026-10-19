# Mock API

A dependency-free Node (>= 22) server that mimics the dummyjson.com product endpoints with
deterministic data, so E2E flows can reach every UI state (end of list, empty, errors, offline).

```sh
npm run mock-api                                # http://0.0.0.0:4010, scenario "ok"
MOCK_API_PORT=4020 MOCK_API_SCENARIO=empty npm run mock-api
```

Point the app at it with `EXPO_PUBLIC_API_BASE_URL=http://localhost:4010`:

- **Android** (emulator or device): `adb reverse tcp:4010 tcp:4010`, then use `localhost`.
- **iOS simulator**: `localhost` works directly.

Plain HTTP is only accepted for loopback hosts (`localhost`, `127.0.0.1`, `10.0.2.2`) outside
dev builds; any other API host must use HTTPS.

## Endpoints

| Route                                | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `GET /products?limit=&skip=&select=` | Product page, same shape as dummyjson (`select` is applied) |
| `GET /products/:id`                  | Full product                                                |
| `GET /__health`                      | `200 {"status":"ok","scenario":…}`                          |
| `GET /__scenario`                    | Current scenario                                            |
| `POST /__scenario`                   | Switch scenario: `{"scenario":"<name>"}` (or `{"name":…}`)  |

```sh
curl -X POST localhost:4010/__scenario -d '{"scenario":"page2-error"}'
```

## Scenarios

| Name           | Behaviour                                                 |
| -------------- | --------------------------------------------------------- |
| `ok` (default) | 194 products built from the real fixtures                 |
| `products-25`  | 25 products: three pages, end of list reachable           |
| `empty`        | `total: 0`                                                |
| `error-500`    | Every product endpoint answers 500                        |
| `page2-error`  | First page works; any `skip > 0` answers 500              |
| `not-found`    | Details answer 404                                        |
| `network-down` | Product requests get their socket destroyed (no response) |
| `slow`         | Product responses are delayed by 2 s                      |

Data comes from `tests/fixtures/*.json`; every request is logged on one line.

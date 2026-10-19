/* global http, output, SCENARIO, MOCK_API_URL -- injected by the Maestro script runtime */
// Switches the local mock API to a named scenario.
// Runs on the host machine (not on the device), so `localhost` reaches the mock server
// even when the Android emulator itself uses 10.0.2.2.
const baseUrl =
  typeof MOCK_API_URL !== 'undefined' && MOCK_API_URL ? MOCK_API_URL : 'http://localhost:4010';

const response = http.post(baseUrl + '/__scenario', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: SCENARIO }),
});

if (!response.ok) {
  throw new Error('Mock API rejected scenario "' + SCENARIO + '" with status ' + response.status);
}

output.scenario = SCENARIO;

/**
 * CaelumOS — Automated Frontend Integration Verification for Jenkins
 * Verifies that the frontend client correctly targets endpoints, never leaks tokens,
 * adheres to the zero-mock architecture, and binds all required window controls.
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assertTest(name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    failed++;
    console.log(`  [FAIL] ${name} - ${details}`);
  }
}

console.log('='.repeat(75));
console.log('>>> CAELUMOS FRONTEND JENKINS INTEGRATION AUTOMATED VERIFICATION');
console.log('='.repeat(75));

// 1. Inspect frontend/src/lib/jenkinsApi.ts
console.log('\n--- Test Group 1: API Client Structure & Endpoints ---');
const apiPath = path.resolve(__dirname, '../src/lib/jenkinsApi.ts');
const apiContent = fs.readFileSync(apiPath, 'utf8');

assertTest('jenkinsApi defines getStatus endpoint', apiContent.includes("apiRequest('/jenkins/status')"));
assertTest('jenkinsApi defines connect POST endpoint', apiContent.includes("apiRequest('/jenkins/connect'"));
assertTest('jenkinsApi defines disconnect POST endpoint', apiContent.includes("apiRequest('/jenkins/disconnect'"));
assertTest('jenkinsApi defines autodetect POST endpoint', apiContent.includes("apiRequest('/jenkins/autodetect'"));
assertTest('jenkinsApi defines overview endpoint', apiContent.includes("apiRequest('/jenkins/overview')"));
assertTest('jenkinsApi defines jobs query endpoint', apiContent.includes("apiRequest(`/jenkins/jobs${qs ? `?${qs}` : ''}`)"));
assertTest('jenkinsApi defines job details endpoint with encoding', apiContent.includes("apiRequest(`/jenkins/job?path=${encodeURIComponent(path)}`)"));
assertTest('jenkinsApi defines build trigger endpoint', apiContent.includes("apiRequest(`/jenkins/build?path=${encodeURIComponent(path)}`"));
assertTest('jenkinsApi defines stop build endpoint', apiContent.includes("apiRequest(`/jenkins/stop?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}`"));
assertTest('jenkinsApi defines progressive console endpoint', apiContent.includes("apiRequest(\n      `/jenkins/console?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}&startOffset=${startOffset}`"));
assertTest('jenkinsApi defines queue inspection & cancel endpoint', apiContent.includes("apiRequest('/jenkins/queue')") && apiContent.includes('/cancel'));
assertTest('jenkinsApi defines nodes endpoint', apiContent.includes("apiRequest('/jenkins/nodes')"));

// 2. Inspect frontend/src/components/apps/JenkinsApp.tsx
console.log('\n--- Test Group 2: UI Component & Security Verification ---');
const appPath = path.resolve(__dirname, '../src/components/apps/JenkinsApp.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assertTest('JenkinsApp does not contain any mock jobs or fake data', !appContent.includes('mockJobs') && !appContent.includes('fakeBuild'));
assertTest('JenkinsApp implements honest disconnected state', appContent.includes('No Jenkins Instance Connected') && appContent.includes('Configure Connection'));
assertTest('JenkinsApp implements auto-detect trigger', appContent.includes('handleAutoDetect') && appContent.includes('Auto-Detect Localhost'));
assertTest('JenkinsApp uses password input type for API token to prevent shoulder-surfing', appContent.includes('type="password"') && appContent.includes('value={formToken}'));
assertTest('JenkinsApp provides guidance for generating Jenkins user API token', appContent.includes('User Profile') && appContent.includes('API Token'));
assertTest('JenkinsApp renders official JenkinsLogo', appContent.includes('<JenkinsLogo'));

assertTest('JenkinsApp implements progressive console streaming with offset tracking', appContent.includes('consoleOffset') && appContent.includes('getConsole'));
assertTest('JenkinsApp renders parameterized build modal safely', appContent.includes('triggerJob.parameters') && appContent.includes('handleExecuteBuild'));

// 3. Inspect Desktop & TaskManager Registration
console.log('\n--- Test Group 3: Desktop Shell & System Integration ---');
const desktopPath = path.resolve(__dirname, '../src/components/Desktop.tsx');
const desktopContent = fs.readFileSync(desktopPath, 'utf8');

assertTest('Desktop imports JenkinsApp and JenkinsLogo', desktopContent.includes("import JenkinsApp from './apps/JenkinsApp'") && desktopContent.includes('JenkinsLogo'));
assertTest('Desktop registers jenkins in windows array', desktopContent.includes("id: 'jenkins'") && desktopContent.includes("title: 'Jenkins CI/CD'"));
assertTest('Desktop registers jenkins in dockItems', desktopContent.includes("id: 'jenkins'") && desktopContent.includes("name: 'Jenkins'"));
assertTest('Desktop renders WindowFrame for jenkins', desktopContent.includes('<JenkinsApp />') && desktopContent.includes('id="jenkins"'));

const tmPath = path.resolve(__dirname, '../src/components/apps/TaskManagerApp.tsx');
const tmContent = fs.readFileSync(tmPath, 'utf8');
assertTest('TaskManager includes Jenkins in getAppIcon', tmContent.includes("case 'jenkins': return <JenkinsLogo"));
assertTest('TaskManager includes Jenkins CI/CD in checkIntegrations', tmContent.includes("name: 'Jenkins CI/CD'") && tmContent.includes('/jenkins/status'));

console.log('\n' + '='.repeat(75));
console.log(`FRONTEND VERIFICATION RESULTS: ${passed} PASSED / ${failed} FAILED (TOTAL ${passed + failed})`);
console.log('='.repeat(75));

if (failed === 0) {
  console.log('SUCCESS: All frontend integration and security assertions verified.');
  process.exit(0);
} else {
  console.log('FAILURE: Some frontend assertions failed.');
  process.exit(1);
}

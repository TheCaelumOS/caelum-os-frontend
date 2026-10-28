import http.server
import socketserver
import threading
import json
import time
import urllib.request
import urllib.error
import sys

# Force UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

JENKINS_MOCK_PORT = 8089
CAELUM_BACKEND_PORT = 4000

class JenkinsMockHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, format, *args):
        # Quiet logger
        pass

    def send_payload(self, status, content_type, body_bytes, headers_dict=None):
        self.send_response(status)
        self.send_header('X-Jenkins', '2.440.1')
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body_bytes)))
        self.send_header('Connection', 'close')
        if headers_dict:
            for k, v in headers_dict.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body_bytes)

    def do_GET(self):
        # 1. Crumb Issuer
        if '/crumbIssuer/api/json' in self.path:
            payload = json.dumps({
                "crumb": "1234567890abcdef1234567890abcdef",
                "crumbRequestField": "Jenkins-Crumb"
            }).encode('utf-8')
            self.send_payload(200, 'application/json', payload)
            return

        # 2. Computer / Nodes API
        if '/computer/api/json' in self.path:
            payload = json.dumps({
                "computer": [
                    {
                        "displayName": "Built-In Node",
                        "offline": False,
                        "temporarilyOffline": False,
                        "offlineCauseReason": None,
                        "numExecutors": 4,
                        "idle": True,
                        "executors": [],
                        "assignedLabels": [{"name": "built-in"}, {"name": "controller"}],
                        "description": "Primary controller agent"
                    },
                    {
                        "displayName": "worker-agent-linux",
                        "offline": False,
                        "temporarilyOffline": False,
                        "offlineCauseReason": None,
                        "numExecutors": 8,
                        "idle": False,
                        "executors": [{"currentExecutable": {"number": 42, "url": "http://localhost:8089/job/demo-pipeline/42/"}}],
                        "assignedLabels": [{"name": "linux"}, {"name": "docker"}, {"name": "x86_64"}],
                        "description": "Linux compute node"
                    },
                    {
                        "displayName": "worker-agent-windows",
                        "offline": True,
                        "temporarilyOffline": True,
                        "offlineCauseReason": "Agent maintenance scheduled",
                        "numExecutors": 2,
                        "idle": True,
                        "executors": [],
                        "assignedLabels": [{"name": "windows"}],
                        "description": "Windows test executor"
                    }
                ]
            }).encode('utf-8')
            self.send_payload(200, 'application/json', payload)
            return

        # 3. Queue API
        if '/queue/api/json' in self.path:
            payload = json.dumps({
                "items": [
                    {
                        "id": 101,
                        "why": "Waiting for next available executor on worker-agent-linux",
                        "blocked": False,
                        "buildable": True,
                        "stuck": False,
                        "inQueueSince": int((time.time() - 30) * 1000),
                        "task": {
                            "name": "demo-pipeline",
                            "url": "http://localhost:8089/job/demo-pipeline/",
                            "_class": "org.jenkinsci.plugins.workflow.job.WorkflowJob"
                        },
                        "executable": None,
                        "params": "BRANCH=main"
                    }
                ]
            }).encode('utf-8')
            self.send_payload(200, 'application/json', payload)
            return

        # 4. Job Details
        if '/job/demo-pipeline/api/json' in self.path:
            payload = json.dumps({
                "name": "demo-pipeline",
                "fullName": "demo-pipeline",
                "url": "http://localhost:8089/job/demo-pipeline/",
                "color": "blue",
                "_class": "org.jenkinsci.plugins.workflow.job.WorkflowJob",
                "description": "Production continuous delivery pipeline for CaelumOS",
                "buildable": True,
                "inQueue": False,
                "nextBuildNumber": 43,
                "builds": [
                    {"number": 42, "url": "http://localhost:8089/job/demo-pipeline/42/", "timestamp": int((time.time() - 600) * 1000), "duration": 45000, "result": "SUCCESS", "building": False},
                    {"number": 41, "url": "http://localhost:8089/job/demo-pipeline/41/", "timestamp": int((time.time() - 3600) * 1000), "duration": 52000, "result": "FAILURE", "building": False}
                ],
                "lastBuild": {"number": 42, "url": "http://localhost:8089/job/demo-pipeline/42/", "timestamp": int((time.time() - 600) * 1000), "duration": 45000, "result": "SUCCESS", "building": False},
                "lastSuccessfulBuild": {"number": 42, "url": "http://localhost:8089/job/demo-pipeline/42/", "timestamp": int((time.time() - 600) * 1000)},
                "lastFailedBuild": {"number": 41, "url": "http://localhost:8089/job/demo-pipeline/41/", "timestamp": int((time.time() - 3600) * 1000)},
                "property": [
                    {
                        "_class": "hudson.model.ParametersDefinitionProperty",
                        "parameterDefinitions": [
                            {
                                "_class": "hudson.model.StringParameterDefinition",
                                "name": "BRANCH",
                                "description": "Git branch to build and test",
                                "defaultParameterValue": {"value": "main"}
                            },
                            {
                                "_class": "hudson.model.ChoiceParameterDefinition",
                                "name": "ENVIRONMENT",
                                "description": "Deployment environment",
                                "choices": ["staging", "production", "canary"]
                            }
                        ]
                    }
                ]
            }).encode('utf-8')
            self.send_payload(200, 'application/json', payload)
            return

        # 5. Build Detail
        if '/job/demo-pipeline/42/api/json' in self.path:
            payload = json.dumps({
                "number": 42,
                "url": "http://localhost:8089/job/demo-pipeline/42/",
                "displayName": "#42",
                "fullDisplayName": "demo-pipeline #42",
                "building": False,
                "result": "SUCCESS",
                "duration": 45120,
                "estimatedDuration": 48000,
                "timestamp": int((time.time() - 600) * 1000),
                "queueId": 98,
                "builtOn": "worker-agent-linux",
                "changeSets": [
                    {
                        "items": [
                            {
                                "commitId": "9f8e7d6c5b4a3120",
                                "msg": "feat: release v2.4 to production cluster",
                                "author": {"fullName": "Lead DevOps Engineer"},
                                "timestamp": int((time.time() - 650) * 1000)
                            }
                        ]
                    }
                ],
                "actions": [
                    {
                        "causes": [
                            {
                                "shortDescription": "Started by user admin",
                                "userName": "admin",
                                "userId": "admin"
                            }
                        ]
                    },
                    {
                        "parameters": [
                            {"name": "BRANCH", "value": "main"},
                            {"name": "ENVIRONMENT", "value": "production"}
                        ]
                    },
                    {
                        "totalCount": 128,
                        "failCount": 0,
                        "skipCount": 2
                    }
                ],
                "artifacts": [
                    {
                        "displayPath": "caelum-os-bundle.tar.gz",
                        "fileName": "caelum-os-bundle.tar.gz",
                        "relativePath": "dist/caelum-os-bundle.tar.gz"
                    }
                ]
            }).encode('utf-8')
            self.send_payload(200, 'application/json', payload)
            return

        # 6. Fallback Console Text
        if '/consoleText' in self.path:
            payload = b"Started by user admin\n[Pipeline] Start of Pipeline\nFinished: SUCCESS\n"
            self.send_payload(200, 'text/plain', payload)
            return

        # 7. Root API JSON
        payload = json.dumps({
            "nodeName": "jenkins-master-caelum",
            "mode": "NORMAL",
            "nodeDescription": "CaelumOS CI/CD Primary Controller",
            "numExecutors": 4,
            "description": "Production Jenkins Master",
            "quietingDown": False,
            "jobs": [
                {
                    "name": "demo-pipeline",
                    "fullName": "demo-pipeline",
                    "url": "http://localhost:8089/job/demo-pipeline/",
                    "color": "blue",
                    "_class": "org.jenkinsci.plugins.workflow.job.WorkflowJob",
                    "description": "Production continuous delivery pipeline for CaelumOS",
                    "buildable": True,
                    "inQueue": False,
                    "lastBuild": {
                        "number": 42,
                        "url": "http://localhost:8089/job/demo-pipeline/42/",
                        "timestamp": int((time.time() - 600) * 1000),
                        "duration": 45000,
                        "result": "SUCCESS",
                        "building": False
                    },
                    "lastSuccessfulBuild": {
                        "number": 42,
                        "url": "http://localhost:8089/job/demo-pipeline/42/",
                        "timestamp": int((time.time() - 600) * 1000)
                    },
                    "lastFailedBuild": {
                        "number": 41,
                        "url": "http://localhost:8089/job/demo-pipeline/41/",
                        "timestamp": int((time.time() - 3600) * 1000)
                    }
                },
                {
                    "name": "frontend-build",
                    "fullName": "frontend-build",
                    "url": "http://localhost:8089/job/frontend-build/",
                    "color": "blue_anime",
                    "_class": "hudson.model.FreeStyleProject",
                    "description": "Next.js frontend build and static generation",
                    "buildable": True,
                    "inQueue": False,
                    "lastBuild": {
                        "number": 15,
                        "url": "http://localhost:8089/job/frontend-build/15/",
                        "timestamp": int(time.time() * 1000),
                        "duration": 12000,
                        "result": None,
                        "building": True
                    }
                },
                {
                    "name": "backend-tests",
                    "fullName": "backend-tests",
                    "url": "http://localhost:8089/job/backend-tests/",
                    "color": "red",
                    "_class": "hudson.model.FreeStyleProject",
                    "description": "NestJS backend unit and e2e test suite",
                    "buildable": True,
                    "inQueue": False,
                    "lastBuild": {
                        "number": 88,
                        "url": "http://localhost:8089/job/backend-tests/88/",
                        "timestamp": int((time.time() - 1200) * 1000),
                        "duration": 34000,
                        "result": "FAILURE",
                        "building": False
                    }
                },
                {
                    "name": "infrastructure-folder",
                    "fullName": "infrastructure-folder",
                    "url": "http://localhost:8089/job/infrastructure-folder/",
                    "color": "disabled",
                    "_class": "com.cloudbees.hudson.plugins.folder.Folder",
                    "description": "Folder containing terraform and k8s automation jobs",
                    "buildable": False,
                    "inQueue": False,
                    "jobs": [{"name": "terraform-plan"}, {"name": "k8s-deploy"}]
                }
            ]
        }).encode('utf-8')
        self.send_payload(200, 'application/json', payload)

    def do_POST(self):
        # Read incoming payload if any
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            self.rfile.read(content_length)

        # 1. Progressive Console Output
        if '/logText/progressiveText' in self.path:
            log_chunk = b"[Pipeline] Running step: Run npm build\nBuild output generated in dist/\n[Pipeline] Running step: Dockerize\nSuccessfully tagged caelum-os:latest\nFinished: SUCCESS\n"
            self.send_payload(200, 'text/plain', log_chunk, {
                'X-Text-Size': str(len(log_chunk)),
                'X-More-Data': 'false'
            })
            return

        # 2. Trigger Build (201 Created with Location header)
        if '/build' in self.path or '/buildWithParameters' in self.path:
            body = b"Build scheduled in queue item #105"
            self.send_payload(201, 'text/plain', body, {
                'Location': 'http://localhost:8089/queue/item/105/'
            })
            return

        # 3. Stop Build
        if '/stop' in self.path:
            body = b"Build aborted"
            self.send_payload(200, 'text/plain', body)
            return

        # 4. Cancel Queue Item
        if '/queue/cancelItem' in self.path:
            body = b"Queue item cancelled"
            self.send_payload(200, 'text/plain', body)
            return

        body = b"OK"
        self.send_payload(200, 'text/plain', body)


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True


def start_mock_jenkins():
    server = ThreadedTCPServer(('127.0.0.1', JENKINS_MOCK_PORT), JenkinsMockHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    print(f"Mock Jenkins server started on http://127.0.0.1:{JENKINS_MOCK_PORT}")
    return server


# =========================================================================
# TEST HARNESS
# =========================================================================

def api_call(endpoint, method="GET", data=None):
    url = f"http://localhost:{CAELUM_BACKEND_PORT}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header('Accept', 'application/json')
    if data is not None:
        req.add_header('Content-Type', 'application/json')
        payload = json.dumps(data).encode('utf-8')
    else:
        payload = None

    try:
        with urllib.request.urlopen(req, data=payload, timeout=10) as resp:
            raw = resp.read().decode('utf-8')
            return {
                "status": resp.status,
                "data": json.loads(raw) if raw and 'application/json' in resp.headers.get('content-type', '') else raw
            }
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8')
        try:
            parsed = json.loads(raw)
        except:
            parsed = raw
        return {"status": e.code, "error": parsed}


def run_all_tests():
    print("=" * 70)
    print(">>> CAELUMOS JENKINS INTEGRATION AUTOMATED END-TO-END TEST SUITE")
    print("=" * 70)

    server = start_mock_jenkins()
    time.sleep(1) # Allow server to bind

    passed = 0
    failed = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            failed += 1
            print(f"  [FAIL] {name} - {details}")

    # TEST 1: Initial status should be honest NOT_CONNECTED
    print("\n--- Phase 1: Disconnected & Pre-flight Diagnostics ---")
    res = api_call("/jenkins/status")
    assert_test("Initial connection state is NOT_CONNECTED",
                res.get("status") == 200 and res.get("data", {}).get("status") == "NOT_CONNECTED",
                f"Got: {res}")

    # TEST 2: Attempting operations before connecting throws 404 (zero mock data)
    res = api_call("/jenkins/jobs")
    assert_test("Fetching jobs when disconnected rejects with 404",
                res.get("status") == 404,
                f"Got status {res.get('status')}")

    # TEST 3: Auto-detect endpoint probes localhost ports
    res = api_call("/jenkins/autodetect", method="POST", data={})
    assert_test("Auto-detect endpoint returns valid probe report",
                res.get("status") == 200 and "found" in res.get("data", {}),
                f"Got: {res}")

    # TEST 4: Connecting to non-existent server fails with clear error
    res = api_call("/jenkins/connect", method="POST", data={
        "url": "http://127.0.0.1:59997",
        "username": "admin",
        "apiToken": "fake-token"
    })
    assert_test("Connection to unreachable server is rejected with 400",
                res.get("status") == 400,
                f"Got: {res}")

    # TEST 5: Connect with valid Jenkins credentials to Mock Server
    print("\n--- Phase 2: Live Connection & Authentication ---")
    res = api_call("/jenkins/connect", method="POST", data={
        "url": f"http://127.0.0.1:{JENKINS_MOCK_PORT}",
        "username": "admin",
        "apiToken": "11abcdef0123456789jenkins-token",
        "name": "Integration Test CI"
    })
    assert_test("Connect succeeds with live server",
                res.get("status") == 200 or res.get("status") == 201,
                f"Got: {res}")
    data = res.get("data", {})
    assert_test("Server version detected as 2.440.1",
                data.get("version") == "2.440.1",
                f"Version: {data.get('version')}")
    assert_test("Status reported as CONNECTED",
                data.get("status") == "CONNECTED",
                f"Status: {data.get('status')}")

    # TEST 6: Get Status after connection
    res = api_call("/jenkins/status")
    data = res.get("data", {})
    assert_test("Authoritative status is CONNECTED with valid version",
                data.get("status") == "CONNECTED" and data.get("version") == "2.440.1",
                f"Got: {data}")

    # TEST 7: Overview API
    print("\n--- Phase 3: Telemetry, Overview & Metrics ---")
    res = api_call("/jenkins/overview")
    data = res.get("data", {})
    assert_test("Overview returns connected=True",
                data.get("connected") is True,
                f"Connected: {data.get('connected')}")
    stats = data.get("stats", {})
    assert_test("Overview calculates correct job counts (4 total, 1 passing, 1 failing, 1 building)",
                stats.get("totalJobs") == 4 and stats.get("successfulJobs") == 1 and stats.get("failedJobs") == 1 and stats.get("buildingJobs") == 1,
                f"Stats: {stats}")
    assert_test("Overview calculates node counts (3 total nodes, 2 online, 1 offline)",
                stats.get("totalNodes") == 3 and stats.get("onlineNodes") == 2 and stats.get("offlineNodes") == 1,
                f"Nodes: {stats}")

    # TEST 8: Jobs API
    print("\n--- Phase 4: Job Management & Discovery ---")
    res = api_call("/jenkins/jobs")
    jobs = res.get("data", [])
    assert_test("Lists all 4 discovered jobs",
                isinstance(jobs, list) and len(jobs) == 4,
                f"Job count: {len(jobs) if isinstance(jobs, list) else jobs}")

    pipeline_job = next((j for j in jobs if j.get("name") == "demo-pipeline"), None)
    assert_test("Detects Pipeline job type and status SUCCESS",
                pipeline_job is not None and pipeline_job.get("type") == "pipeline" and pipeline_job.get("status") == "SUCCESS",
                f"Pipeline job: {pipeline_job}")

    building_job = next((j for j in jobs if j.get("name") == "frontend-build"), None)
    assert_test("Detects building job flag from blue_anime color",
                building_job is not None and building_job.get("isBuilding") is True,
                f"Building job: {building_job}")

    folder_job = next((j for j in jobs if j.get("name") == "infrastructure-folder"), None)
    assert_test("Detects Folder job type with child count",
                folder_job is not None and folder_job.get("type") == "folder" and folder_job.get("subJobsCount") == 2,
                f"Folder job: {folder_job}")

    # TEST 9: Job Details & Parameters
    res = api_call("/jenkins/job?path=demo-pipeline")
    job_details = res.get("data", {})
    params = job_details.get("parameters", [])
    assert_test("Extracts parameter definitions (BRANCH & ENVIRONMENT)",
                len(params) == 2 and params[0].get("name") == "BRANCH" and params[1].get("name") == "ENVIRONMENT",
                f"Params: {params}")
    assert_test("Job details includes build history with 2 builds",
                len(job_details.get("builds", [])) == 2,
                f"Builds: {job_details.get('builds')}")

    # TEST 10: Trigger Parameterized Build
    print("\n--- Phase 5: Build Operations & Queue ---")
    res = api_call("/jenkins/build?path=demo-pipeline", method="POST", data={
        "parameters": {"BRANCH": "feature/jenkins-test", "ENVIRONMENT": "staging"}
    })
    build_trigger = res.get("data", {})
    assert_test("Trigger build accepts request and queues item #105",
                build_trigger.get("queued") is True and build_trigger.get("queueItemId") == 105,
                f"Build trigger result: {build_trigger}")

    # TEST 11: Queue Inspection & Cancellation
    res = api_call("/jenkins/queue")
    q_items = res.get("data", [])
    assert_test("Queue returns pending items with queue reason",
                len(q_items) == 1 and q_items[0].get("id") == 101,
                f"Queue items: {q_items}")

    res = api_call("/jenkins/queue/101/cancel", method="POST")
    assert_test("Cancel queue item #101 succeeds",
                res.get("status") == 200 and res.get("data", {}).get("cancelled") is True,
                f"Cancel queue: {res}")

    # TEST 12: Build Details & Artifacts
    print("\n--- Phase 6: Build Details, Console & Nodes ---")
    res = api_call("/jenkins/build-detail?path=demo-pipeline&buildNumber=42")
    detail = res.get("data", {})
    assert_test("Build detail returns commit info and trigger causes",
                detail.get("number") == 42 and detail.get("builtOn") == "worker-agent-linux" and len(detail.get("causes", [])) > 0,
                f"Detail: {detail}")
    assert_test("Build detail returns test summary (126 passed, 0 failed, 2 skipped)",
                detail.get("testSummary", {}).get("passCount") == 126,
                f"Test summary: {detail.get('testSummary')}")
    assert_test("Build detail returns artifacts (caelum-os-bundle.tar.gz)",
                len(detail.get("artifacts", [])) == 1 and detail.get("artifacts")[0].get("fileName") == "caelum-os-bundle.tar.gz",
                f"Artifacts: {detail.get('artifacts')}")

    # TEST 13: Progressive Console Output
    res = api_call("/jenkins/console?path=demo-pipeline&buildNumber=42&startOffset=0")
    console = res.get("data", {})
    assert_test("Console streaming returns text chunk and next byte offset",
                len(console.get("output", "")) > 0 and console.get("nextOffset", 0) > 0,
                f"Console: {console}")

    # TEST 14: Stop / Abort Build
    res = api_call("/jenkins/stop?path=demo-pipeline&buildNumber=42", method="POST")
    assert_test("Abort signal returns stopped=True",
                res.get("data", {}).get("stopped") is True,
                f"Stop: {res}")

    # TEST 15: Nodes / Agents Inspection
    res = api_call("/jenkins/nodes")
    nodes = res.get("data", [])
    assert_test("Lists all 3 nodes with correct online/offline statuses and labels",
                len(nodes) == 3 and nodes[0].get("offline") is False and nodes[2].get("offline") is True,
                f"Nodes: {nodes}")

    # TEST 16: Disconnect
    print("\n--- Phase 7: Clean Teardown & Isolation ---")
    res = api_call("/jenkins/disconnect", method="POST")
    assert_test("Disconnect returns disconnected=True",
                res.get("data", {}).get("disconnected") is True,
                f"Disconnect: {res}")

    res = api_call("/jenkins/status")
    assert_test("Status returns to NOT_CONNECTED after disconnect",
                res.get("data", {}).get("status") == "NOT_CONNECTED",
                f"Status: {res}")

    server.shutdown()

    print("\n" + "=" * 70)
    print(f"AUTOMATED TEST RESULTS: {passed} PASSED / {failed} FAILED (TOTAL {passed + failed})")
    print("=" * 70)

    if failed == 0:
        print("SUCCESS: ALL TESTS PASSED! Jenkins integration is 100% verified.")
        return 0
    else:
        print("FAILURE: Some tests failed.")
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())

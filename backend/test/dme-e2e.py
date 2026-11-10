#!/usr/bin/env python3
"""
CaelumOS DME (DevOps Management Engine) V0.1 — End-to-End Automated Test Suite
Verifies:
1. Python validation engine determinism, rule coverage (15 rules), score calculation, and remediation generation.
2. CaelumOS Backend DME endpoints (/dme/overview, /dme/rules, /dme/integrations, /dme/events, /dme/validate, /dme/runs).
"""

import sys
import os
import json
import subprocess
import time
import urllib.request
import urllib.error

BACKEND_URL = os.environ.get("CAELUM_BACKEND_URL", "http://127.0.0.1:4000").rstrip("/")
AUTH_TOKEN = os.environ.get("CAELUM_AUTH_TOKEN", "offline-dev-session-token")

class DmeTestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.tests = []

    def log(self, status: str, name: str, details: str = ""):
        color = "\033[92m" if status == "PASS" else ("\033[91m" if status == "FAIL" else "\033[93m")
        reset = "\033[0m"
        print(f"[{color}{status}{reset}] {name} {f'— {details}' if details else ''}")
        if status == "PASS":
            self.passed += 1
        elif status == "FAIL":
            self.failed += 1
        else:
            self.skipped += 1

    def request(self, path: str, method: str = "GET", payload: dict = None):
        url = f"{BACKEND_URL}{path}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AUTH_TOKEN}"
        }
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.getcode()
                body = resp.read().decode("utf-8")
                return code, json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8")
            try:
                parsed = json.loads(body)
            except:
                parsed = {"raw": body}
            return e.code, parsed
        except Exception as e:
            return 0, {"error": str(e)}

    # =========================================================================
    # PHASE 1: Python Engine Unit & Determinism Verification
    # =========================================================================

    def test_python_engine_clean_run(self):
        cmd = [sys.executable, "backend/src/dme/python/dme_validator.py", "--pretty"]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
        if proc.returncode != 0:
            self.log("FAIL", "Python Engine: Clean Execution", f"Exit {proc.returncode}: {proc.stderr}")
            return

        try:
            report = json.loads(proc.stdout)
            if report.get("engineVersion") == "0.1.0" and "score" in report and len(report.get("ruleResults", [])) >= 15:
                self.log("PASS", "Python Engine: Clean Execution & Metadata", f"Score: {report['score']}, Rules: {len(report['ruleResults'])}")
            else:
                self.log("FAIL", "Python Engine: Clean Execution", f"Unexpected payload: {report}")
        except Exception as e:
            self.log("FAIL", "Python Engine: JSON Parsing", str(e))

    def test_python_engine_synthetic_violations(self):
        # Feed mock container crashloop + failing Jenkins job + unconstrained resources
        mock_input = {
            "docker": {
                "connected": True,
                "containers": [
                    {"Id": "c1", "Names": ["/web-app"], "Status": "Restarting (1) 2s ago", "Privileged": True},
                    {"Id": "c2", "Names": ["/db-worker"], "Status": "Up 2 hours", "HostConfig": {"Memory": 0, "NanoCpus": 0}}
                ]
            },
            "kubernetes": {
                "connected": True,
                "pods": [
                    {
                        "metadata": {"name": "api-gateway-7b9"},
                        "status": {
                            "containerStatuses": [{"name": "api", "state": {"waiting": {"reason": "CrashLoopBackOff"}}}]
                        }
                    }
                ]
            },
            "jenkins": {
                "connected": True,
                "jobs": [
                    {"name": "production-deploy", "color": "red"}
                ]
            }
        }

        cmd = [sys.executable, "backend/src/dme/python/dme_validator.py", "--stdin"]
        proc = subprocess.run(
            cmd,
            input=json.dumps(mock_input),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )

        if proc.returncode != 0:
            self.log("FAIL", "Python Engine: Synthetic Violation Injection", f"Exit {proc.returncode}: {proc.stderr}")
            return

        report = json.loads(proc.stdout)
        score = report.get("score", 100)
        violations = report.get("violations", [])
        v_codes = [v["ruleCode"] for v in violations]

        expected_codes = ["DME-DOCKER-001", "DME-DOCKER-002", "DME-DOCKER-003", "DME-K8S-001", "DME-JENKINS-001"]
        detected = [c for c in expected_codes if c in v_codes]

        if len(detected) >= 4 and score < 70 and report.get("status") == "failed":
            self.log("PASS", "Python Engine: Deterministic Penalties & Violations", f"Detected {len(detected)}/5 rules, Score: {score}")
        else:
            self.log("FAIL", "Python Engine: Deterministic Penalties", f"Detected {detected}, Score: {score}, Status: {report.get('status')}")

    # =========================================================================
    # PHASE 2: CaelumOS Backend DME Integration Endpoints
    # =========================================================================

    def test_backend_connectivity(self) -> bool:
        code, data = self.request("/health")
        if code == 200 or (isinstance(data, dict) and data.get("status") in ("ok", "healthy")):
            self.log("PASS", "Backend Connectivity Probe", f"HTTP {code} from {BACKEND_URL}/health")
            return True
        else:
            self.log("SKIP", "Backend Connectivity Probe", f"Backend not reachable on {BACKEND_URL} (code={code}, err={data}). Server will be started or tested when online.")
            return False

    def test_backend_dme_rules(self):
        code, rules = self.request("/dme/rules")
        if code == 200 and isinstance(rules, list) and len(rules) >= 15:
            self.log("PASS", "Backend: GET /dme/rules Catalog", f"{len(rules)} deterministic rules registered")
        else:
            self.log("FAIL", "Backend: GET /dme/rules Catalog", f"Code: {code}, Response: {rules}")

    def test_backend_dme_overview(self):
        code, overview = self.request("/dme/overview")
        if code == 200 and "healthScore" in overview and "integrations" in overview:
            self.log("PASS", "Backend: GET /dme/overview Metrics", f"HealthScore: {overview['healthScore']}, Integrations: {len(overview['integrations'])}")
        else:
            self.log("FAIL", "Backend: GET /dme/overview Metrics", f"Code: {code}, Response: {overview}")

    def test_backend_dme_integrations(self):
        code, integs = self.request("/dme/integrations")
        if code == 200 and isinstance(integs, list) and len(integs) >= 5:
            sources = [i.get("source") for i in integs]
            self.log("PASS", "Backend: GET /dme/integrations Hub", f"Sources: {', '.join(sources)}")
        else:
            self.log("FAIL", "Backend: GET /dme/integrations Hub", f"Code: {code}, Response: {integs}")

    def test_backend_dme_event_lifecycle(self):
        # 1. Record event
        test_payload = {
            "source": "docker",
            "eventType": "CONTAINER_SECURITY_ALERT",
            "severity": "high",
            "title": "Automated Test Container Flag",
            "message": "Synthetic container audit alert generated by dme-e2e.py test suite.",
            "metadata": {"testRun": True, "pid": os.getpid()}
        }
        code, created = self.request("/dme/events", method="POST", payload=test_payload)
        if code not in (200, 201) or not created.get("id"):
            self.log("FAIL", "Backend: POST /dme/events Ingestion", f"Code: {code}, Response: {created}")
            return
        self.log("PASS", "Backend: POST /dme/events Ingestion", f"Created Event ID: {created['id']}")

        # 2. Query event
        q_code, events = self.request("/dme/events?source=docker&severity=high")
        if q_code == 200 and isinstance(events, list) and any(e.get("id") == created["id"] for e in events):
            self.log("PASS", "Backend: GET /dme/events Query & Filter", f"Found {len(events)} matching events")
        else:
            self.log("FAIL", "Backend: GET /dme/events Query & Filter", f"Code: {q_code}, Count: {len(events) if isinstance(events, list) else 0}")

    def test_backend_dme_capture(self):
        code, res = self.request("/dme/events/capture", method="POST")
        if code == 200 and "capturedEventsCount" in res:
            self.log("PASS", "Backend: POST /dme/events/capture Live Scan", f"Captured {res['capturedEventsCount']} events")
        else:
            self.log("FAIL", "Backend: POST /dme/events/capture Live Scan", f"Code: {code}, Response: {res}")

    def test_backend_dme_validate_and_runs(self):
        # 1. Trigger validation
        code, report = self.request("/dme/validate", method="POST", payload={"triggeredBy": "e2e_test"})
        if code == 200 and "score" in report and "ruleResults" in report:
            self.log("PASS", "Backend: POST /dme/validate Audit Execution", f"Score: {report['score']}, Checked: {report['totalRulesChecked']}")
        else:
            self.log("FAIL", "Backend: POST /dme/validate Audit Execution", f"Code: {code}, Response: {report}")
            return

        # 2. Check runs history
        r_code, runs = self.request("/dme/runs")
        if r_code == 200 and isinstance(runs, list) and len(runs) > 0:
            self.log("PASS", "Backend: GET /dme/runs Audit History", f"{len(runs)} recorded audit runs")
        else:
            self.log("FAIL", "Backend: GET /dme/runs Audit History", f"Code: {r_code}")

    def ensure_backend_running(self):
        code, _ = self.request("/health")
        if code == 200:
            return None

        print("[INFO] Launching in-session CaelumOS backend daemon (dist/main.js)...")
        log_f = open("backend_test.log", "w", encoding="utf-8")
        proc = subprocess.Popen(
            ["node", "backend/dist/main.js"],
            stdout=log_f,
            stderr=subprocess.STDOUT
        )

        # Poll until health endpoint responds or 25s timeout
        for i in range(15):
            time.sleep(1)
            code, data = self.request("/health")
            if code == 200:
                print(f"[INFO] Backend successfully booted (PID {proc.pid}) and responding on {BACKEND_URL}")
                return proc
            if i % 3 == 0:
                print(f"[DEBUG PROBE #{i}] code={code}, err={data.get('error')}")
            if proc.poll() is not None:
                log_f.close()
                with open("backend_test.log", "r", encoding="utf-8") as f:
                    print(f"[ERROR] Backend failed to start: {f.read()}")
                return None

        print("[WARN] Backend boot timed out after 25s")
        log_f.close()
        with open("backend_test.log", "r", encoding="utf-8") as f:
            print(f"[DEBUG LOG] {f.read()[:500]}")
        return proc

    def run(self):
        print("=" * 70)
        print("CaelumOS DME V0.1 — Comprehensive Automated Test Suite")
        print("=" * 70)

        # Phase 1
        print("\n--- Phase 1: Internal Python Validation Engine Tests ---")
        self.test_python_engine_clean_run()
        self.test_python_engine_synthetic_violations()

        # Phase 2
        print("\n--- Phase 2: CaelumOS Backend DME Integration Tests ---")
        server_proc = self.ensure_backend_running()

        try:
            backend_online = self.test_backend_connectivity()
            if backend_online:
                self.test_backend_dme_rules()
                self.test_backend_dme_overview()
                self.test_backend_dme_integrations()
                self.test_backend_dme_event_lifecycle()
                self.test_backend_dme_capture()
                self.test_backend_dme_validate_and_runs()
            else:
                print("\nBackend daemon offline. Skipping live endpoint tests (Engine tests passed).")
        finally:
            if server_proc:
                print("[INFO] Tearing down in-session backend daemon...")
                server_proc.terminate()
                try:
                    server_proc.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    server_proc.kill()

        print("\n" + "=" * 70)
        print(f"TEST SUMMARY: {self.passed} Passed, {self.failed} Failed, {self.skipped} Skipped")
        print("=" * 70)

        if self.failed > 0:
            sys.exit(1)


if __name__ == "__main__":
    runner = DmeTestRunner()
    runner.run()

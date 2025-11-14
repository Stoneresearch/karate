import os
from fastapi.testclient import TestClient
from backend.main import app


def test_health_ok():
    with TestClient(app) as c:
        r = c.get("/health")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


def test_infer_requires_api_key(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", "dev-secret")
    with TestClient(app) as c:
        r = c.post("/api/v1/ai/infer", json={"model": "stable-diffusion-3.5", "prompt": "hi"})
        assert r.status_code == 401


def test_infer_success_with_api_key(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", "dev-secret")
    with TestClient(app) as c:
        r = c.post(
            "/api/v1/ai/infer",
            headers={"x-api-key": "dev-secret", "x-user-id": "user_123"},
            json={"model": "stable-diffusion-3.5", "prompt": "hello world"},
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("model") == "stable-diffusion-3.5"
        assert data.get("prompt") == "hello world"
        assert "task_id" in data


def test_infer_unknown_model(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", "dev-secret")
    with TestClient(app) as c:
        r = c.post(
            "/api/v1/ai/infer",
            headers={"x-api-key": "dev-secret"},
            json={"model": "not-a-model", "prompt": "hi"},
        )
        assert r.status_code == 400



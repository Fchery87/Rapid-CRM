import pytest
import anyio
import httpx

from services.parser.main import app  # type: ignore


@pytest.mark.anyio
async def test_parse_from_url_contract_inline():
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "downloadUrl": "inline:dummy",
            "objectKey": "seed/demo-report-1.html",
            "accountId": "acct_123"
        }
        res = await client.post("/parse-from-url", json=payload)
        assert res.status_code == 200
        data = res.json()

        # Top-level fields
        assert data["ok"] is True
        assert data["vendor"] == "demo-vendor"
        assert data["objectKey"] == payload["objectKey"]
        assert data["accountId"] == payload["accountId"]
        for key in ["bureaus", "personalInfo", "tradelines", "inquiries", "publicRecords"]:
            assert key in data

        # Bureaus and scores
        bureaus = {b["bureau"]: b["score"] for b in data["bureaus"]}
        assert set(bureaus.keys()) == {"TU", "EX", "EQ"}
        assert isinstance(bureaus["TU"], int)

        # Personal info must have one per bureau
        assert len(data["personalInfo"]) == 3
        assert {p["bureau"] for p in data["personalInfo"]} == {"TU", "EX", "EQ"}

        # Tradelines: expected 3 with required fields
        tls = data["tradelines"]
        assert len(tls) == 3
        for t in tls:
            assert "creditorName" in t and isinstance(t["creditorName"], str)
            assert "reportedBureaus" in t and len(t["reportedBureaus"]) >= 1

        # Inquiries and public records basic checks
        assert len(data["inquiries"]) >= 1
        assert "kind" in data["publicRecords"][0]


@pytest.mark.anyio
async def test_parse_upload_stub():
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        files = {"file": ("report.html", b"<html></html>", "text/html")}
        res = await client.post("/parse", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["objectKey"] == "uploaded"
        # No normalized data in stub upload path
        assert data["tradelines"] == []
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import httpx

app = FastAPI(title="Parser Service", version="0.1.0")


class BureauScore(BaseModel):
    bureau: Literal["TU", "EX", "EQ"]
    score: Optional[int] = None


class PersonalInfo(BaseModel):
    bureau: Literal["TU", "EX", "EQ"]
    name: Optional[str] = None
    ssnLast4: Optional[str] = None
    dob: Optional[str] = None
    addressLine: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal: Optional[str] = None


class Tradeline(BaseModel):
    creditorName: str
    balance: Optional[int] = None
    creditLimit: Optional[int] = None
    utilization: Optional[float] = None
    isNegative: bool = False
    issues: List[str] = Field(default_factory=list)
    reportedBureaus: List[Literal["TU", "EX", "EQ"]] = Field(default_factory=list)
    openedDate: Optional[str] = None
    closedDate: Optional[str] = None


class Inquiry(BaseModel):
    name: str
    date: Optional[str] = None
    hard: bool = True


class PublicRecord(BaseModel):
    kind: str
    description: Optional[str] = None
    date: Optional[str] = None
    isNegative: bool = True


class NormalizedReport(BaseModel):
    ok: bool = True
    vendor: str
    reportDate: str
    objectKey: str
    accountId: str
    bureaus: List[BureauScore] = Field(default_factory=list)
    personalInfo: List[PersonalInfo] = Field(default_factory=list)
    tradelines: List[Tradeline] = Field(default_factory=list)
    inquiries: List[Inquiry] = Field(default_factory=list)
    publicRecords: List[PublicRecord] = Field(default_factory=list)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    # Stub: read the file; return minimal normalized structure
    _ = await file.read()
    vendor = "unknown"
    now = datetime.utcnow().date().isoformat()
    result = NormalizedReport(
        vendor=vendor,
        reportDate=now,
        objectKey="uploaded",
        accountId="unknown",
        bureaus=[],
        personalInfo=[],
        tradelines=[],
        inquiries=[],
        publicRecords=[],
    )
    return JSONResponse(result.model_dump())


class ParseFromUrlPayload(BaseModel):
    downloadUrl: str
    objectKey: str
    accountId: str


@app.post("/parse-from-url")
async def parse_from_url(payload: ParseFromUrlPayload):
    # Allow inline payload for contract tests without external HTTP
    if payload.downloadUrl.startswith("inline:"):
        content = payload.downloadUrl[len("inline:") :].encode("utf-8")
    else:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(payload.downloadUrl)
            resp.raise_for_status()
            content = resp.content

    # Heuristic stub: derive a repeatable normalized doc for contract tests
    vendor = "demo-vendor" if "demo" in payload.objectKey else "unknown"
    today = datetime.utcnow().date().isoformat()

    # In a real parser, we'd inspect 'content' and extract fields.
    normalized = NormalizedReport(
        vendor=vendor,
        reportDate=today,
        objectKey=payload.objectKey,
        accountId=payload.accountId,
        bureaus=[
            BureauScore(bureau="TU", score=688),
            BureauScore(bureau="EX", score=701),
            BureauScore(bureau="EQ", score=695),
        ],
        personalInfo=[
            PersonalInfo(bureau="TU", name="Alex Q. Doe", ssnLast4="1234", dob="1990-01-01", addressLine="123 Main St", city="Austin", state="TX", postal="78701"),
            PersonalInfo(bureau="EX", name="Alex Doe", ssnLast4="1234", dob="1990-01-01", addressLine="123 Main Street", city="Austin", state="TX", postal="78701"),
            PersonalInfo(bureau="EQ", name="Alex Q Doe", ssnLast4="1234", dob="1990-01-01", addressLine="125 Main St", city="Austin", state="TX", postal="78701"),
        ],
        tradelines=[
            Tradeline(creditorName="Capital One", balance=1200, creditLimit=3000, utilization=40, isNegative=True, issues=["late_payment"], reportedBureaus=["TU", "EX"], openedDate="2023-01-01"),
            Tradeline(creditorName="Chase", balance=50, creditLimit=5000, utilization=1, isNegative=False, issues=[], reportedBureaus=["EQ"], openedDate="2022-01-01"),
            Tradeline(creditorName="Discover", balance=2800, creditLimit=3000, utilization=93, isNegative=True, issues=["high_utilization"], reportedBureaus=["TU", "EQ"], openedDate="2024-01-01"),
        ],
        inquiries=[
            Inquiry(name="Car Loan Co", date="2024-09-01", hard=True),
            Inquiry(name="Credit Card Offer", date="2024-08-15", hard=False),
        ],
        publicRecords=[
            PublicRecord(kind="tax_lien", description="County tax lien", date="2022-06-01", isNegative=True),
        ],
    )
    return JSONResponse(normalized.model_dump())
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx

app = FastAPI(title="Parser Service", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    # Stub implementation for contract: accept file and return basic metadata
    content = await file.read()
    size = len(content)
    vendor_guess = "unknown"
    return JSONResponse({"ok": True, "size": size, "vendor": vendor_guess})


class ParseFromUrlPayload(BaseModel):
  downloadUrl: str
  objectKey: str
  accountId: str


@app.post("/parse-from-url")
async def parse_from_url(payload: ParseFromUrlPayload):
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.get(payload.downloadUrl)
        resp.raise_for_status()
        content = resp.content
    size = len(content)
    vendor_guess = "unknown"
    # In real parse, extract fields and return normalized data
    return JSONResponse({"ok": True, "size": size, "vendor": vendor_guess, "objectKey": payload.objectKey, "accountId": payload.accountId})
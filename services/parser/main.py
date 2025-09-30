from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

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
"use client";

import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UploadPage() {
  const [accountName, setAccountName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string>("");
  const [account, setAccount] = React.useState<{ id: string; name: string } | null>(null);
  const [uploads, setUploads] = React.useState<any[]>([]);
  const [loadingList, setLoadingList] = React.useState(false);

  const loadUploads = async (accountId: string) => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API_URL}/uploads/account/${accountId}`);
      const data = await res.json();
      setUploads(data);
    } finally {
      setLoadingList(false);
    }
  };

  const ensureAccount = async (name: string) => {
    const res = await fetch(`${API_URL}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error("Failed to ensure account");
    const data = await res.json();
    setAccount(data);
    await loadUploads(data.id);
    return data;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setProgress(0);
    if (!file) {
      setMessage("Please choose a file.");
      return;
    }
    if (!accountName.trim()) {
      setMessage("Please enter an account name.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("File too large (max 10MB).");
      return;
    }
    // basic type acceptance
    const allowed = ["text/html", "application/zip", "application/x-zip-compressed"];
    if (!allowed.includes(file.type)) {
      setMessage("Invalid file type. Upload HTML or ZIP.");
      return;
    }
    try {
      const acc = await ensureAccount(accountName.trim());
      const signRes = await fetch(`${API_URL}/uploads/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: acc.name,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size
        })
      });
      if (!signRes.ok) throw new Error("Failed to sign upload");
      const { url } = await signRes.json();

      await putWithProgress(url, file, setProgress);
      setMessage("Upload complete.");
      await loadUploads(acc.id);
    } catch (err: any) {
      setMessage(err.message || "Upload failed.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Upload Credit Report</h1>
      <form onSubmit={onSubmit} className="space-y-4" aria-describedby="upload-help">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium">
            Account name
          </label>
          <input
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium">
            Report file (HTML or ZIP, max 10MB)
          </label>
          <input
            id="file"
            type="file"
            accept=".html,.htm,.zip"
            className="mt-1 block w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <p id="upload-help" className="text-sm text-gray-600">
          Files are stored securely and processed after upload.
        </p>
        <button
          type="submit"
          className="rounded-md bg-brand-700 text-white px-4 py-2 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          Upload
        </button>
      </form>

      {progress > 0 && progress < 100 && (
        <div aria-live="polite">
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-brand-600 rounded" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm mt-1">{progress}%</p>
        </div>
      )}

      {message && <p role="status" className="text-sm">{message}</p>}

      <section aria-live="polite">
        <h2 className="text-lg font-medium">Recent uploads {account ? `for ${account.name}` : ""}</h2>
        {loadingList ? (
          <p>Loading...</p>
        ) : uploads.length === 0 ? (
          <p className="text-sm text-gray-600">No uploads yet.</p>
        ) : (
          <ul className="divide-y">
            {uploads.map((u) => (
              <li key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.originalName}</div>
                  <div className="text-xs text-gray-600">
                    {Math.round(u.size / 1024)} KB · {new Date(u.createdAt).toLocaleString()}
                  </div>
                </div>
                <a
                  className="text-brand-700 underline"
                  href={u.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

async function putWithProgress(url: string, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}
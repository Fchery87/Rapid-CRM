const GRAFANA_URL = process.env.GRAFANA_URL || "http://localhost:3001";
const ADMIN_USER = process.env.GRAFANA_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.GRAFANA_ADMIN_PASSWORD || "admin";

function btoa(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function createServiceAccount(name = "ci-service") {
  const res = await fetch(`${GRAFANA_URL}/api/serviceaccounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`
    },
    body: JSON.stringify({ name, role: "Editor", isDisabled: false })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create service account: ${res.status} ${text}`);
  }
  const sa = await res.json();
  return sa;
}

async function createToken(saId, tokenName = "ci-token") {
  const res = await fetch(`${GRAFANA_URL}/api/serviceaccounts/${saId}/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`
    },
    body: JSON.stringify({ name: tokenName, role: "Editor" })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create token: ${res.status} ${text}`);
  }
  const token = await res.json();
  return token;
}

async function main() {
  try {
    const sa = await createServiceAccount();
    const token = await createToken(sa.id);
    console.log(JSON.stringify({ serviceAccount: sa, token }, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
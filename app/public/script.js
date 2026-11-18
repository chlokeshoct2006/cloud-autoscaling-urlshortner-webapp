async function shorten() {
  const urlInput = document.getElementById("urlInput");
  const resultDiv = document.getElementById("result");
  const url = urlInput.value.trim();

  if (!url) {
    alert("Please enter a valid URL!");
    return;
  }

  try {
    const res = await fetch("/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      throw new Error("Failed to shorten URL");
    }

    const data = await res.json();
    const fullUrl = window.location.origin + data.shortUrl;

    resultDiv.className = "result";
    resultDiv.innerHTML = `
      <div class="result-item"><strong>Short URL:</strong> <a class="short-link" href="${fullUrl}" target="_blank">${fullUrl}</a></div>
      <div class="result-item"><strong>Target URL:</strong> ${url}</div>
      <div class="result-item"><strong>Served by Pod:</strong> <span class="badge">${data.pod}</span></div>
    `;
    urlInput.value = "";
  } catch (err) {
    resultDiv.className = "result";
    resultDiv.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
  }
}

async function generateLoad(count) {
  const statusDiv = document.getElementById("loadStatus");
  statusDiv.innerHTML = `⏳ Sending ${count} load request(s) to simulate traffic...`;

  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(fetch("/load").then(r => r.text()));
  }

  try {
    const responses = await Promise.all(promises);
    const pods = new Set(responses.map(r => r.trim()));
    statusDiv.innerHTML = `✅ Finished ${count} load request(s) handled by pod(s):<br/><strong>${Array.from(pods).join("<br/>")}</strong>`;
  } catch (err) {
    statusDiv.innerHTML = `❌ Error during load generation: ${err.message}`;
  }
}

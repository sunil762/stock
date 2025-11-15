import React, { useState, useEffect } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [history, setHistory] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const uploadImage = async () => {
    if (!file) return setError("Choose an image first.");
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/predict", {
        method: "POST",
        body: form,
        headers,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error");
      }
      const data = await res.json();
      setResult(data);
      if (token) fetchHistory();
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const j = await res.json();
        setHistory(j);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const register = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Registered. Now login.");
    } catch (e) {
      setError(e.message);
    }
  };

  const login = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();
      setToken(j.access_token);
      localStorage.setItem("token", j.access_token);
      setError(null);
      fetchHistory();
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">SMC Market Image Prediction</h1>
        <p className="text-sm text-slate-600 mb-6">Upload a market chart image, receive SMC-based prediction and annotated image.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Choose image</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="mt-2" />

            {preview && (
              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700">Preview</div>
                <img src={preview} alt="preview" className="mt-2 rounded-lg max-h-64 object-contain w-full border" />
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button onClick={uploadImage} disabled={uploading} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">{uploading ? "Predicting..." : "Upload & Predict"}</button>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); setError(null); }} className="px-3 py-2 rounded-lg border">Reset</button>
            </div>

            {error && <div className="mt-4 text-red-600">Error: {error}</div>}

            {result && (
              <div className="mt-4 p-3 border rounded">
                <div className="text-sm text-slate-500">Label</div>
                <div className="text-lg font-semibold">{result.prediction}</div>
                <div className="text-sm">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                {result.annotated_path && (<div className="mt-2"><a href={result.annotated_path} target="_blank" rel="noreferrer" className="text-blue-600">Open annotated image</a></div>)}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="p-4 rounded-lg border h-full flex flex-col gap-3">
              <div>
                {!token ? (
                  <div>
                    <div className="text-sm font-medium">Login / Register</div>
                    <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-2 p-2 border rounded" />
                    <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-2 p-2 border rounded" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={register} className="px-3 py-2 border rounded">Register</button>
                      <button onClick={login} className="px-3 py-2 bg-green-600 text-white rounded">Login</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium">Account</div>
                    <div className="mt-2 text-sm">Logged in</div>
                    <button onClick={logout} className="mt-2 px-3 py-2 border rounded">Logout</button>
                  </div>
                )}
              </div>

              <div className="mt-auto text-xs text-slate-400">History shows your previous uploads and predictions.</div>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Your upload history</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {history.map((h) => (
                <div key={h.id} className="p-2 border rounded">
                  <img src={h.original_path} alt="uploaded" className="w-full h-28 object-contain" />
                  <div className="text-sm mt-1">{h.prediction} ({(h.confidence*100).toFixed(1)}%)</div>
                  {h.annotated_path && <a href={h.annotated_path} className="text-xs text-blue-600">Annotated</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-slate-600">
          <strong>Notes:</strong> For production, serve the frontend statically and protect the API with HTTPS and rate limits.
        </div>
      </div>
    </div>
  );
}

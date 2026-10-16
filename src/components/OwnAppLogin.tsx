"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "own_client_id";

export default function OwnAppLogin() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [copied, setCopied] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setRedirectUri(`${window.location.origin}/api/auth/callback`);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setClientId(saved);
    } catch {
      // Storage unavailable (private mode); the user can paste the ID again
    }
    if (new URLSearchParams(window.location.search).get("error") === "invalid_client_id") {
      setOpen(true);
      setInvalid(true);
    }
  }, []);

  const valid = /^[0-9a-f]{32}$/i.test(clientId.trim());

  const login = () => {
    const id = clientId.trim();
    if (!/^[0-9a-f]{32}$/i.test(id)) {
      setInvalid(true);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore storage errors
    }
    window.location.href = `/api/auth/login?client_id=${id}`;
  };

  const copyRedirect = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the URI is still visible for manual copy
    }
  };

  return (
    <div className="mt-4 text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-center text-sm text-gray-500 dark:text-gray-400 underline hover:text-spotify-green"
      >
        Can&apos;t see your playlists? Log in with your own Spotify app
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-xl bg-gray-100 dark:bg-spotify-lightgray text-sm space-y-3">
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Spotify only lets a few approved accounts use this app. To use it with your own
                account, create a free Spotify developer app (one time, about 2 minutes) and log in
                through it. Requires Spotify Premium.
              </p>

              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-200 text-xs">
                <li>
                  Open the{" "}
                  <a
                    href="https://developer.spotify.com/dashboard/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spotify-green underline"
                  >
                    Spotify Developer Dashboard
                  </a>{" "}
                  and log in with your Spotify account.
                </li>
                <li>Create an app with any name and description, and tick <b>Web API</b>.</li>
                <li>
                  Under <b>Redirect URIs</b> add exactly:
                  <div className="mt-1 flex gap-2 items-center">
                    <code className="flex-1 min-w-0 truncate px-2 py-1 rounded bg-white dark:bg-black/40 text-[11px]">
                      {redirectUri}
                    </code>
                    <button
                      onClick={copyRedirect}
                      className="shrink-0 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[11px]"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </li>
                <li>Save, then copy the app&apos;s <b>Client ID</b> and paste it below.</li>
              </ol>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  login();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setInvalid(false);
                  }}
                  placeholder="Your Client ID"
                  spellCheck={false}
                  autoComplete="off"
                  className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white dark:bg-black/40 text-xs font-mono outline-none focus:ring-2 focus:ring-spotify-green"
                />
                <button
                  type="submit"
                  disabled={!valid}
                  className="px-4 py-2 rounded-full bg-spotify-green hover:bg-green-400 text-black font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  Log in
                </button>
              </form>
              {invalid && (
                <p className="text-red-400 text-xs">
                  That doesn&apos;t look like a Client ID (32 letters and digits).
                </p>
              )}
              <p className="text-gray-400 dark:text-gray-500 text-[11px]">
                The Client ID is not secret and is only remembered in this browser.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ScanContext — global store for the most recent scan result.
 *
 * Why this exists:
 *   React Router's `location.state` is ephemeral — it disappears the moment
 *   the user navigates away (back button, direct link, etc.).  All three
 *   analysis pages (Analysis, Explainable, Behavioral) previously relied on
 *   location.state, so navigating between them lost the data.
 *
 *   This context keeps the last scan result in React state AND backs it up to
 *   sessionStorage so it survives soft page refreshes within the same tab.
 */

import React, { createContext, useState, useContext, useCallback } from 'react';

const SESSION_KEY = 'scamdetect_last_scan';

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToSession(result) {
  try {
    if (result) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage may be blocked in some private-browsing modes — ignore
  }
}

export const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [scanResult, setScanResultState] = useState(() => loadFromSession());
  const [originalInput, setOriginalInputState] = useState(null);

  const setScanResult = useCallback((result, input = null) => {
    setScanResultState(result);
    setOriginalInputState(input);
    saveToSession(result);
  }, []);

  const clearScan = useCallback(() => {
    setScanResultState(null);
    setOriginalInputState(null);
    saveToSession(null);
  }, []);

  return (
    <ScanContext.Provider value={{ scanResult, originalInput, setScanResult, clearScan }}>
      {children}
    </ScanContext.Provider>
  );
}

/** Convenience hook */
export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used inside <ScanProvider>');
  return ctx;
}

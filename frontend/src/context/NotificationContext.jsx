import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { WS_BASE } from '../config/api';

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [lastScan, setLastScan] = useState(null);

    useEffect(() => {
        // Determine websocket URL based on current host
        const wsUrl = `${WS_BASE}/ws/notifications`;
        let ws = new WebSocket(wsUrl);

        const connect = () => {
            ws.onopen = () => {
                console.log('WebSocket Connected for Real-Time Notifications');
            };

            ws.onmessage = (event) => {
                try {
                    const scan = JSON.parse(event.data);
                    setLastScan(scan); // Save to state so other components (like Recent Scans) can react

                    // Show toast notification based on risk level
                    showScanToast(scan);
                } catch (err) {
                    console.error('Error parsing websocket message:', err);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket Disconnected. Reconnecting in 5s...');
                setTimeout(() => {
                    ws = new WebSocket(wsUrl);
                    connect();
                }, 5000);
            };

            ws.onerror = (err) => {
                console.error('WebSocket Error:', err);
                ws.close();
            };
        };

        connect();

        return () => {
            ws.onclose = null; // Prevent reconnect loop on unmount
            ws.close();
        };
    }, []);

    const showScanToast = (scan) => {
        // Format the threat categories nicely
        let cats = scan.threat_categories;
        if (typeof cats === 'string') {
            try { cats = JSON.parse(cats); } catch (e) { cats = []; }
        }
        const catString = cats && cats.length > 0 ? cats.join(', ') : 'Suspicious Activity';

        if (scan.risk_level === 'Critical' || scan.risk_level === 'High') {
            toast.error(
                <div>
                    <strong>🔴 {scan.risk_level} Threat Detected!</strong>
                    <div className="text-sm mt-1">{catString}</div>
                    <div className="text-xs text-gray-500 mt-1">Score: {scan.risk_score}/100</div>
                </div>,
                { duration: 6000, style: { border: '1px solid #ef4444', padding: '16px', color: '#7f1d1d' } }
            );
        } else if (scan.risk_level === 'Medium') {
            toast(
                <div>
                    <strong>🟠 Warning: Medium Risk</strong>
                    <div className="text-sm mt-1">{catString}</div>
                </div>,
                { icon: '⚠️', duration: 4000, style: { border: '1px solid #f59e0b', padding: '16px' } }
            );
        } else {
            toast.success(
                <div>
                    <strong>🟢 Clean Scan</strong>
                    <div className="text-sm mt-1">No significant threats found.</div>
                </div>,
                { duration: 3000, style: { border: '1px solid #10b981', padding: '16px' } }
            );
        }
    };

    return (
        <NotificationContext.Provider value={{ lastScan }}>
            {children}
        </NotificationContext.Provider>
    );
};

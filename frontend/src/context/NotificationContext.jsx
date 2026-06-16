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

        // Only show global toasts for High or Critical network-wide threats
        if (scan.risk_level === 'Critical' || scan.risk_level === 'High') {
            const sourceDisplay = scan.source ? `Source: ${scan.source}` : 'Unknown Source';
            toast.error(
                <div>
                    <strong className="text-xs uppercase tracking-widest font-body">🚨 Global Alert: {scan.risk_level} Threat</strong>
                    <div className="text-sm font-bold mt-1 font-display">{catString}</div>
                    <div className="text-xs mt-1 font-body text-red-700">{sourceDisplay}</div>
                </div>,
                { duration: 8000, style: { border: '2px solid #111111', padding: '16px', color: '#111111', backgroundColor: '#fca5a5', borderRadius: '0', boxShadow: '4px 4px 0px #111111' } }
            );
        }
    };

    return (
        <NotificationContext.Provider value={{ lastScan }}>
            {children}
        </NotificationContext.Provider>
    );
};

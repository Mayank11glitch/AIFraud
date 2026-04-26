import sqlite3

conn = sqlite3.connect('d:/ASEP2/backend/scamdetect.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

cursor.execute("SELECT id, type, risk_score, timestamp FROM scan_records ORDER BY timestamp DESC LIMIT 5")
print("Scan Records:")
for row in cursor.fetchall():
    print(row)
conn.close()

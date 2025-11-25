import sqlite3

conn = sqlite3.connect('doc_summarizer.db')
cursor = conn.cursor()

print('=== ORGANIZATIONS ===')
orgs = cursor.execute('SELECT id, name, plan_type, created_at FROM organizations').fetchall()
for org in orgs:
    print(f'Name: {org[1]} | Plan: {org[2]} | Created: {org[3][:10]}')

print('\n=== USERS ===')
users = cursor.execute('SELECT email, full_name, role, created_at FROM users ORDER BY created_at').fetchall()
for user in users:
    print(f'Email: {user[0]} | Name: {user[1]} | Role: {user[2]} | Created: {user[3][:10]}')

conn.close()

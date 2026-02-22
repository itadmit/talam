מעולה — הם כבר נתנו לך קונספט חזק, עכשיו צריך להפוך את זה ל־אפיון מערכת מקצועי לפיתוח Next.js שאפשר להגיש/להראות/להתחיל לפתח ממנו.

אני אכתוב לך אפיון מלא ברמה של Product + System + Dev — כולל אדמין, הרשאות, בילדר טפסים, משתמשים, חיפוש חכם וכו'.

(תוכל להעתיק ולהגיש כמו שהוא או לערוך).

📄 אפיון מערכת — תל״מ Anywhere
פורטל ידע ופעולות לקצינים — מבוסס Next.js
1️⃣ מטרת המערכת

מערכת תל״מ Anywhere היא פורטל Web מאובטח לניהול ידע, זכויות, פניות וטפסים עבור קצינים ביחידה צה"לית.

המערכת מאפשרת:

גישה מכל מקום (Desktop / Mobile)

ניהול ידע ונהלים

פתיחת פניות למדורים

הורדת והגשת טפסים

חיפוש חכם במידע

שקיפות סטטוסים בין מדורים

מערכת אדמין לניהול תוכן מלא

המערכת אינה מכילה מידע אישי רגיש אלא מידע תפעולי בלבד.

2️⃣ סוגי משתמשים והרשאות
👤 קצין (User)

התחברות למערכת

צפייה במידע לפי קטגוריות

פתיחת פניות

צפייה בפניות אישיות

הורדת טפסים

חתימה על טפסים

חיפוש מידע

שימוש בבוט/חיפוש חכם

🧑‍💼 מנהל מדור (Department Manager)

עריכת מידע בקטגוריה שלו

מענה לפניות

עדכון סטטוסים

העלאת מסמכים

עדכון אנשי קשר

🛠 Admin מערכת

ניהול משתמשים

ניהול הרשאות

ניהול קטגוריות

ניהול טפסים

בניית טפסים (Form Builder)

ניהול תוכן מלא

צפייה בדשבורד מערכת

ניהול מדדים

3️⃣ ארכיטקטורת המערכת
Frontend

Next.js 14 (App Router)

React

Tailwind / Design System

Mobile First

Backend

API Routes / Server Actions

Auth Server Side

Queue לפניות

Database

PostgreSQL (Supabase / RDS)

Storage

S3 / Supabase Storage

Authentication

Email login

OTP

MFA

4️⃣ מודל התחברות ואבטחה
התחברות

הזנת אימייל מאושר מראש

שליחת קוד OTP

אימות דו שלבי

אבטחה

RBAC הרשאות

הצפנת מידע

JWT session

Audit logs

Rate limiting

אין שמירת מידע רפואי אישי

5️⃣ מבנה המערכת (Modules)
🏠 דף הבית (Dashboard)
רכיבים:

חיפוש מרכזי

8 קטגוריות ככרטיסים

פניות פתוחות

עדכונים

גישה מהירה

UI:

Tiles גדולים

Mobile First

Dark mode

📚 מרכז מידע (Knowledge Hub)
מבנה "כרטיס זכות":

שם הזכות

תיאור פשוט

סטטוס מידע

גורם מטפל

קבצים מצורפים

הורדת טופס

קטגוריות:

משאבי אנוש

בריאות

קהילה

חוסן

אנשי קשר

קישורים

עדויות

טבלת קהילה

🎫 מערכת פניות (Ticketing)
יכולות:

פתיחת פנייה

בחירת מדור

תיאור מקרה

צירוף קבצים

סטטוס טיפול

היסטוריית פניות

סטטוסים:

פתוח

בטיפול

הושלם

ממתין

📊 טבלת קהילה (Live Dashboard)

מצב מידע לפי מדור

מדד בריאות מידע

חוסרים

אנשי קשר תורנים

סטטוס עדכון מידע

📄 מערכת טפסים (Form System)
יכולות:

הורדת טפסים

מילוי אונליין

חתימה דיגיטלית

שליחה למדור

שמירת היסטוריה

6️⃣ 🔧 מערכת אדמין (CMS + Control Panel)

מערכת קריטית.

ניהול תוכן

יצירת כתבות

העלאת מסמכים

ניהול קטגוריות

עריכת זכויות

Form Builder (בילדר טפסים)
רכיבים:

Text input

Dropdown

Checkbox

Upload

חתימה דיגיטלית

שדות חובה

לוגיקת תנאים

ניהול משתמשים

הוספת קצינים

הרשאות

ניהול מיילים מאושרים

שיוך למדורים

ניהול פניות

צפייה

מענה

שיוך למדור

סטטיסטיקות

7️⃣ חיפוש חכם (שלב ראשון במקום AI)
יכולות:

חיפוש מלא במסמכים

חיפוש זכויות

חיפוש טפסים

תיקון שגיאות כתיב

חיפוש סמנטי בסיסי

טכנולוגיה:

PostgreSQL Full Text
או

Typesense / Algolia

8️⃣ Chatbot זכויות (שלב מתקדם)

שלב 1:

חיפוש חכם בלבד

שלב 2:

RAG על מסמכים

Chat Widget

תשובות לפי מסמכים

9️⃣ מודל נתונים (High Level)
Tables
Users

id

email

role

department_id

Departments

name

contact

KnowledgeItems

title

category

status

description

Tickets

user_id

department_id

status

messages

Forms

schema_json

Submissions

form_id

user_id

🔟 UI/UX עקרונות

Mobile First

RTL

כפתורים גדולים

ניווט פשוט

מצב כהה

נגישות AA

11️⃣ Non Functional Requirements

זמינות 99.9%

טעינה < 2 שניות

סקייל למאות משתמשים

אבטחת מידע גבוהה

audit trail

12️⃣ Roadmap פיתוח
Phase 1 (MVP — שבועיים)

Login + OTP

Dashboard

Knowledge Hub

חיפוש

Ticketing בסיסי

Admin בסיסי

Phase 2

Form Builder

חתימה דיגיטלית

Dashboard מדורים

Phase 3

AI Bot

Analytics

Automation

------

יאללה. הנה אפיון טכני למפתחים (API Endpoints) + ארכיטקטורת DB מלאה (ERD טבלאות + שדות + קשרים) — מותאם ל־Next.js (App Router) עם RBAC, OTP, CMS, Ticketing, Form Builder, חיפוש חכם, ולוגים.

✅ אפיון טכני למפתחים — API Endpoints
קונבנציות כלליות

Base: /api

Auth: Cookie session / JWT (HttpOnly)

RBAC: role = user | dept_manager | admin

כל בקשה מזוהה עם userId מה־session

Response אחיד:

{ "ok": true, "data": {...}, "error": null }

1) Auth & Security
POST /api/auth/request-otp

מטרה: בקשת קוד OTP למייל מאושר
Body:

{ "email": "user@gmail.com" }


Logic:

בדיקת whitelisted email

יצירת OTP + expiry

שליחה (Email/SMS לפי הגדרה)
Response: { ok, data: { otpSent: true } }

POST /api/auth/verify-otp

מטרה: אימות OTP ויצירת session
Body:

{ "email": "user@gmail.com", "code": "123456" }


Response: { ok, data: { user: {...} } }

POST /api/auth/logout

מטרה: ניתוק session

GET /api/auth/me

מטרה: פרטי משתמש מחובר + הרשאות
Response:

{ "ok": true, "data": { "user": {...}, "permissions": [...] } }

2) Users (Admin)
GET /api/admin/users

Query: ?q=&role=&departmentId=&page=1

admin בלבד

POST /api/admin/users

יצירת משתמש / אישור מייל
Body:

{ "email": "...", "role": "user", "departmentId": null, "isActive": true }

PATCH /api/admin/users/:id

עדכון role, department, active

DELETE /api/admin/users/:id

השבתה (soft delete מומלץ)

3) Departments (Admin)
GET /api/admin/departments
POST /api/admin/departments

Body:

{ "name": "משא\"ן", "description": "...", "phone": "...", "dutyContact": {...} }

PATCH /api/admin/departments/:id
GET /api/departments/:id/duty

החזרת תורן נוכחי

4) Categories (Admin/CMS)
GET /api/categories

לכולם (לפי הרשאות)

POST /api/admin/categories
PATCH /api/admin/categories/:id
DELETE /api/admin/categories/:id
5) Knowledge Hub (CMS)
GET /api/knowledge

Query:

?categoryId=&status=&q=&page=1

חיפוש טקסט

GET /api/knowledge/:id

פריט ידע + קבצים + טפסים קשורים

POST /api/admin/knowledge

(admin / dept_manager בקטגוריה שלו)
Body:

{
  "categoryId": "uuid",
  "title": "תוכנית שיקום",
  "summary": "תיאור קצר",
  "content": "<rich text/markdown>",
  "status": "green|yellow|red",
  "ownerDepartmentId": "uuid",
  "tags": ["דיור","שכר דירה"]
}

PATCH /api/admin/knowledge/:id
DELETE /api/admin/knowledge/:id
POST /api/admin/knowledge/:id/attachments

multipart upload (PDF/DOCX)
Response: attachment metadata

6) Links Library
GET /api/links

Query: ?categoryId=&q=&page=1

POST /api/admin/links

Body:

{ "title": "ביטוח לאומי", "url": "...", "description": "...", "ownerDepartmentId": "uuid" }

PATCH /api/admin/links/:id
DELETE /api/admin/links/:id
7) Contacts Directory
GET /api/contacts

Query: ?departmentId=&q=

POST /api/admin/contacts

Body:

{ "name": "איש קשר", "roleTitle": "ק. ת\"ש", "phone": "...", "email": "...", "departmentId": "uuid", "isDuty": false }

PATCH /api/admin/contacts/:id
POST /api/admin/contacts/:id/set-duty

מסמן כתורן + תוקף זמן

8) Ticketing System
POST /api/tickets

User
Body:

{ "departmentId": "uuid", "subject": "שאלה על שכר דירה", "message": "..." , "isAnonymous": true }

GET /api/tickets

User: רק שלו
Dept/Admin: לפי מדור
Query: ?status=&departmentId=&page=1

GET /api/tickets/:id

כולל thread messages + attachments

POST /api/tickets/:id/messages

הוספת הודעה
Body:

{ "message": "...", "visibility": "private|shared" }


shared = מופיע גם ב"שקיפות בבירורים" לאחר סינון/אישור מדור (מומלץ)

PATCH /api/tickets/:id/status

Body:

{ "status": "open|in_progress|waiting|done" }

POST /api/tickets/:id/attachments

upload

POST /api/tickets/:id/publish

הפיכה ל"שאלה ציבורית" לשקיפות (dept_manager/admin)

9) Community Dashboard (שקיפות)
GET /api/community/health

מחזיר:

מדורים

מדד בריאות מידע

כמות פריטים אדומים/צהובים

פניות פתוחות

"חוסרי מידע"

GET /api/community/questions

רשימת שאלות/תשובות שפורסמו לשקיפות
Query: ?q=&departmentId=&page=1

10) Forms + Form Builder
GET /api/forms

Query: ?q=&categoryId=&ownerDepartmentId=&page=1

GET /api/forms/:id

כולל schema json + הגדרות

POST /api/admin/forms

יצירת טופס (schema)
Body:

{
  "title": "בקשת חריג",
  "categoryId": "uuid",
  "ownerDepartmentId": "uuid",
  "schema": { "fields":[...], "logic":[...] },
  "requiresSignature": true,
  "status": "active|draft"
}

PATCH /api/admin/forms/:id
DELETE /api/admin/forms/:id
POST /api/forms/:id/submit

User submits
Body:

{ "answers": {...}, "signature": "base64/assetId", "attachments": ["assetId1"] }

GET /api/submissions

User: שלו בלבד
Dept/Admin: לפי ownerDepartmentId
Query: ?status=&formId=&page=1

GET /api/submissions/:id
PATCH /api/submissions/:id/status

Body:

{ "status": "received|in_review|approved|rejected", "note": "..." }

GET /api/submissions/:id/pdf

ייצוא PDF עם תשובות+חתימה (server-side)

11) Search (Smart Search)
GET /api/search

Query: ?q=...&type=all|knowledge|forms|contacts|links|tickets
Response:

{
  "ok": true,
  "data": {
    "results": [{ "type":"knowledge", "id":"...", "title":"...", "snippet":"..." }]
  }
}


מימוש: Full-Text + ranking + synonyms + typo tolerance (אם Typesense/Algolia)

12) Audit / Logs (Admin)
GET /api/admin/audit

Query: ?userId=&action=&from=&to=&page=1

GET /api/admin/metrics

מדדים כלליים: כניסות, חיפושים, פריטים, פניות וכו׳

✅ ארכיטקטורת DB מלאה (ERD)
עקרונות

UUID לכל טבלה

soft delete איפה שצריך (deletedAt)

timestamps בכל טבלה (createdAt, updatedAt)

audit log לכל פעולה קריטית

הפרדה בין ידע לבין טפסים/הגשות לבין פניות

1) users
field	type	notes
id	uuid PK	
email	varchar unique	login
phone	varchar nullable	אם OTP SMS
role	enum(user, dept_manager, admin)	RBAC
departmentId	uuid FK nullable	למנהל מדור
isActive	boolean	
lastLoginAt	timestamp	
createdAt/updatedAt	timestamp	

Relations:

users.departmentId -> departments.id

2) email_whitelist

מאפשר “אימייל פרטי מאושר מראש”

field	type
id	uuid PK
email	varchar unique
addedByUserId	uuid FK users
isActive	boolean
notes	text
createdAt	
3) otp_codes
field	type
id	uuid PK
email	varchar
codeHash	varchar
channel	enum(email,sms)
expiresAt	timestamp
attempts	int
consumedAt	timestamp nullable
createdAt	
4) departments
field	type
id	uuid PK
name	varchar
description	text
phone	varchar nullable
email	varchar nullable
createdAt/updatedAt	timestamp
5) department_duty

תורן מדורי (כולל טווח זמן)

field	type
id	uuid PK
departmentId	uuid FK
contactId	uuid FK contacts
startsAt	timestamp
endsAt	timestamp nullable
isActive	boolean
6) categories

8 קטגוריות (או יותר בעתיד)

field	type
id	uuid PK
key	varchar unique
name	varchar
icon	varchar nullable
order	int
isActive	boolean
7) knowledge_items
field	type
id	uuid PK
categoryId	uuid FK categories
ownerDepartmentId	uuid FK departments
title	varchar
summary	text
content	text (markdown/html)
status	enum(green,yellow,red)
statusNote	text nullable
updatedByUserId	uuid FK users
publishedAt	timestamp nullable
createdAt/updatedAt	timestamp
deletedAt	timestamp nullable
8) knowledge_tags

| id | uuid |
| name | varchar unique |

9) knowledge_item_tags

| knowledgeItemId | uuid FK |
| tagId | uuid FK |
PK composite

10) assets

קבצים מצורפים (S3/Supabase)

field	type
id	uuid PK
ownerType	enum(knowledge,ticket,form,submission,other)
ownerId	uuid
fileName	varchar
mimeType	varchar
size	int
storageKey	varchar
uploadedByUserId	uuid FK users
createdAt	
11) links
field	type
id	uuid PK
categoryId	uuid FK categories nullable
ownerDepartmentId	uuid FK departments nullable
title	varchar
url	text
description	text
createdAt/updatedAt	timestamp
deletedAt	timestamp nullable
12) contacts
field	type
id	uuid PK
departmentId	uuid FK departments
name	varchar
roleTitle	varchar
phone	varchar
email	varchar
isPublic	boolean default true
createdAt/updatedAt	timestamp
13) tickets
field	type
id	uuid PK
createdByUserId	uuid FK users
departmentId	uuid FK departments
subject	varchar
status	enum(open,in_progress,waiting,done)
isAnonymous	boolean
publishedToCommunity	boolean
createdAt/updatedAt	timestamp
closedAt	timestamp nullable
14) ticket_messages
field	type
id	uuid PK
ticketId	uuid FK tickets
senderUserId	uuid FK users
message	text
visibility	enum(private,shared)
createdAt	
15) community_qna

שקיפות בבירורים (לא חובה להוציא מכל ticket ישירות)

field	type
id	uuid PK
ticketId	uuid FK tickets
question	text
answer	text
approvedByUserId	uuid FK users
departmentId	uuid FK departments
createdAt	
16) forms
field	type
id	uuid PK
categoryId	uuid FK categories
ownerDepartmentId	uuid FK departments
title	varchar
description	text
schema	jsonb
requiresSignature	boolean
status	enum(draft,active,archived)
version	int
createdAt/updatedAt	timestamp
deletedAt	timestamp nullable
17) form_submissions
field	type
id	uuid PK
formId	uuid FK forms
submittedByUserId	uuid FK users
status	enum(received,in_review,approved,rejected)
answers	jsonb
signatureAssetId	uuid FK assets nullable
submittedAt	timestamp
reviewedByUserId	uuid FK users nullable
reviewNote	text nullable
updatedAt	
18) search_index (אופציונלי)

אם לא משתמשים במנוע חיצוני
| id | uuid |
| entityType | enum(knowledge,form,contact,link,community) |
| entityId | uuid |
| text | tsvector / text |
| updatedAt |

19) audit_logs
field	type
id	uuid PK
userId	uuid FK users
action	varchar
entityType	varchar
entityId	uuid
ip	varchar
userAgent	text
meta	jsonb
createdAt	
🔗 ERD קשרים מרכזיים (במילים)

departments 1—N contacts

categories 1—N knowledge_items

departments 1—N knowledge_items (ownerDepartmentId)

users 1—N tickets

tickets 1—N ticket_messages

forms 1—N form_submissions

assets שייכים ל־entity באמצעות ownerType/ownerId (פשוט וגמיש)

audit_logs מתעד הכל
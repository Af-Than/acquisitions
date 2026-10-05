# acquisitions
NPM RUN DB GENERATE WILL GENERATE THE NEW MIGRATION FILE

NPM RUN DB:MIGRATE WILL MIGRATE THE FILE INTO THE NEON DATABASE


USING WINSTON FOR THE AUTHENTICATION

morgan and helmet is also used


//information about the logger
info: ::1 - - [05/Oct/2026:16:36:51 +0000] "GET / HTTP/1.1" 200 40 "-" "Mozilla/5.0..." {"service":"aquisitions-api", ...}
  │    │        │                       │               │   │    │    │                    │
  │    │        │                       │               │   │    │    └─ User-Agent        └─ Service Metadata (JSON)
  │    │        │                       │               │   │    └────── Referrer ("-")
  │    │        │                       │               │   └────────── Response Size (Bytes)
  │    │        │                       │               └────────────── HTTP Status Code (200 = OK, 404 = Not Found)
  │    │        │                       └────────────────────────────── Request Method & Endpoint
  │    │        └────────────────────────────────────────────────────── Timestamp
  │    └─────────────────────────────────────────────────────────────── Client IP Address (IPv6 Localhost)
  └──────────────────────────────────────────────────────────────────── Log Level
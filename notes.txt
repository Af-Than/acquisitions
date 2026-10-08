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



  basically attaching the cookie to the HTTP such that it is secure and we bind the jwt token to the cookie so we do not have to send it each time if a user is logged in 


  Think of Zod as an automated guard at the entrance of your backend.

When building Node.js/Express APIs in plain JavaScript, your server receives raw data from users through req.body (like JSON from forms). If someone submits invalid or incomplete data, it can crash your server or corrupt your database.

Zod gives you a simple way to define a blueprint (schema) of what your data must look like, check incoming data against that blueprint, and handle errors automatically.
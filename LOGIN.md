# Local Login Reference

Dev-only credentials for the locally running instance. Not for production use.

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (docs at `/docs`)

## Admin dashboard

http://localhost:3000/admin/login

| Email | Password |
|---|---|
| admin@example.com | AdminPass123! |

To create another admin or reset this password:

```bash
cd backend
python scripts/create_admin.py <email> "<password>" --first <First> --last <Last>
```

## Customer login

http://localhost:3000/login

Two test accounts exist from earlier testing (password `password123` for both,
neither has purchased a package yet):

| Email |
|---|
| smoke@example.com |
| integration-test@example.com |

To see the full purchase → onboarding → Everfit flow, register a fresh account
at http://localhost:3000/register instead of reusing these.

"""Creates (or resets the password for) an admin user. Admins are never
self-registered through the public API, so this CLI script is the only way to
provision one.

Usage:
    python scripts/create_admin.py owner@example.com "a-strong-password" --first Jane --last Doe
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.admin_user import AdminUser  # noqa: E402
from app.models.enums import AdminRole  # noqa: E402


def create_admin(
    email: str, password: str, first_name: str, last_name: str, role: AdminRole
) -> None:
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.email == email.lower()).first()
        if admin is None:
            admin = AdminUser(
                email=email.lower(),
                first_name=first_name,
                last_name=last_name,
                role=role,
            )
            db.add(admin)
            action = "Created"
        else:
            action = "Updated password for"

        admin.hashed_password = hash_password(password)
        admin.is_active = True
        db.commit()
        print(f"{action} admin user {email} (role={role.value})")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("email")
    parser.add_argument("password")
    parser.add_argument("--first", default="Admin")
    parser.add_argument("--last", default="User")
    parser.add_argument("--role", default="admin", choices=["admin", "staff"])
    args = parser.parse_args()

    create_admin(args.email, args.password, args.first, args.last, AdminRole(args.role))

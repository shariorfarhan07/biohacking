"""Seeds packages, programmes, assignment rules, and a demo discount code for
local development. Safe to run more than once — every insert is guarded by an
existence check keyed on the row's natural identifier (slug/code)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal  # noqa: E402
from app.models.assignment_rule import AssignmentRule  # noqa: E402
from app.models.discount_code import DiscountCode  # noqa: E402
from app.models.enums import BillingInterval  # noqa: E402
from app.models.package import Package  # noqa: E402
from app.models.programme import Programme  # noqa: E402

# Base monthly price (in pence) per coaching category. Purely illustrative,
# editable data — not a real business assumption baked into the app.
BASE_MONTHLY_PRICE_PENCE = {
    "fat-loss": 14900,
    "muscle-building": 14900,
    "body-recomposition": 15900,
    "performance-longevity": 17900,
    "advanced-performance-support": 24900,
}

# Longer commitments get a modest effective discount, applied to the total
# charge for that billing cycle.
INTERVAL_CONFIG = [
    (BillingInterval.MONTHLY, 1, 1.0),
    (BillingInterval.THREE_MONTH, 3, 0.95),
    (BillingInterval.SIX_MONTH, 6, 0.90),
    (BillingInterval.TWELVE_MONTH, 12, 0.80),
]

PACKAGE_DEFINITIONS = [
    {
        "key": "fat-loss",
        "name": "Fat Loss",
        "description": (
            "A structured fat-loss programme built around sustainable calorie "
            "management, resistance training to preserve lean muscle, and weekly "
            "coach check-ins to keep you accountable."
        ),
        "features": [
            "Personalised training programme in Everfit",
            "Nutrition guidance tailored to your goals",
            "Weekly coach check-ins",
            "Direct messaging with your coach",
            "Progress tracking and photo check-ins",
        ],
    },
    {
        "key": "muscle-building",
        "name": "Muscle Building",
        "description": (
            "A progressive hypertrophy-focused programme designed to build lean "
            "muscle through structured overload, tailored nutrition, and "
            "consistent coaching support."
        ),
        "features": [
            "Progressive overload training plan",
            "Calorie and macro guidance for growth",
            "Weekly coach check-ins",
            "Exercise technique video reviews",
            "Strength and physique progress tracking",
        ],
    },
    {
        "key": "body-recomposition",
        "name": "Body Recomposition",
        "description": (
            "Simultaneously build muscle and reduce body fat with a carefully "
            "periodised training and nutrition plan built around your recovery "
            "and lifestyle."
        ),
        "features": [
            "Periodised training programme",
            "Nutrition plan built for recomposition",
            "Weekly coach check-ins",
            "Body composition tracking",
            "Ongoing plan adjustments as you progress",
        ],
    },
    {
        "key": "performance-longevity",
        "name": "Performance & Longevity",
        "description": (
            "For men who train for long-term performance, mobility, and "
            "healthspan — combining strength training with recovery and "
            "lifestyle coaching."
        ),
        "features": [
            "Performance-focused training programme",
            "Mobility and recovery protocols",
            "Sleep, stress, and lifestyle coaching",
            "Weekly coach check-ins",
            "Long-term periodisation planning",
        ],
    },
    {
        "key": "advanced-performance-support",
        "name": "Advanced Performance Support",
        "description": (
            "Our highest tier of coaching for experienced men who want closer "
            "support around training, nutrition, and lifestyle systems while "
            "working within a strict coaching and education boundary."
        ),
        "features": [
            "Everything in Performance & Longevity",
            "Priority coach communication",
            "More frequent check-ins",
            "Advanced training periodisation",
            "Lifestyle and recovery systems coaching",
        ],
    },
]

PROGRAMME_DEFINITIONS = [
    ("general-foundations", "General Foundations", "efit-prog-general-foundations"),
    ("fat-loss-gym", "Fat Loss — Gym Programme", "efit-prog-fat-loss-gym"),
    (
        "fat-loss-home-low-frequency",
        "Fat Loss — Home (Low Frequency)",
        "efit-prog-fat-loss-home-low",
    ),
    (
        "fat-loss-home-high-frequency",
        "Fat Loss — Home (High Frequency)",
        "efit-prog-fat-loss-home-high",
    ),
    ("muscle-building-gym", "Muscle Building — Gym Programme", "efit-prog-muscle-gym"),
    ("muscle-building-home", "Muscle Building — Home Programme", "efit-prog-muscle-home"),
    (
        "body-recomposition-standard",
        "Body Recomposition Programme",
        "efit-prog-recomposition",
    ),
    (
        "performance-longevity-standard",
        "Performance & Longevity Programme",
        "efit-prog-performance-longevity",
    ),
    (
        "advanced-performance-support",
        "Advanced Performance Support Programme",
        "efit-prog-advanced-support",
    ),
]

RULE_DEFINITIONS = [
    (
        "Fat Loss + Home + Low Frequency",
        10,
        {
            "all": [
                {"field": "goal", "op": "eq", "value": "fat_loss"},
                {"field": "training_location", "op": "eq", "value": "home"},
                {"field": "training_days_per_week", "op": "in", "value": [1, 2, 3]},
            ]
        },
        "fat-loss-home-low-frequency",
    ),
    (
        "Fat Loss + Home + High Frequency",
        11,
        {
            "all": [
                {"field": "goal", "op": "eq", "value": "fat_loss"},
                {"field": "training_location", "op": "eq", "value": "home"},
                {"field": "training_days_per_week", "op": "in", "value": [4, 5, 6, 7]},
            ]
        },
        "fat-loss-home-high-frequency",
    ),
    (
        "Fat Loss + Gym or Hybrid",
        12,
        {
            "all": [
                {"field": "goal", "op": "eq", "value": "fat_loss"},
                {"field": "training_location", "op": "in", "value": ["gym", "hybrid"]},
            ]
        },
        "fat-loss-gym",
    ),
    (
        "Muscle Building + Home",
        20,
        {
            "all": [
                {"field": "goal", "op": "eq", "value": "muscle_building"},
                {"field": "training_location", "op": "eq", "value": "home"},
            ]
        },
        "muscle-building-home",
    ),
    (
        "Muscle Building + Gym or Hybrid",
        21,
        {
            "all": [
                {"field": "goal", "op": "eq", "value": "muscle_building"},
                {"field": "training_location", "op": "in", "value": ["gym", "hybrid"]},
            ]
        },
        "muscle-building-gym",
    ),
    (
        "Body Recomposition — Any Location",
        30,
        {"all": [{"field": "goal", "op": "eq", "value": "recomposition"}]},
        "body-recomposition-standard",
    ),
    (
        "Performance & Longevity — Any Location",
        40,
        {"all": [{"field": "goal", "op": "eq", "value": "performance"}]},
        "performance-longevity-standard",
    ),
    (
        "General Health — Any Location",
        50,
        {"all": [{"field": "goal", "op": "eq", "value": "general_health"}]},
        "general-foundations",
    ),
]


def seed() -> None:
    db = SessionLocal()
    try:
        package_count = 0
        for definition in PACKAGE_DEFINITIONS:
            base_price = BASE_MONTHLY_PRICE_PENCE[definition["key"]]
            for interval, months, discount_factor in INTERVAL_CONFIG:
                slug = f"{definition['key']}-{interval.value}"
                if db.query(Package).filter(Package.slug == slug).first() is not None:
                    continue
                total_price = round(base_price * months * discount_factor)
                db.add(
                    Package(
                        slug=slug,
                        name=definition["name"],
                        description=definition["description"],
                        price_cents=total_price,
                        currency="gbp",
                        billing_interval=interval,
                        features=definition["features"],
                        is_active=True,
                        sort_order=PACKAGE_DEFINITIONS.index(definition),
                    )
                )
                package_count += 1

        programme_by_slug: dict[str, Programme] = {}
        programme_count = 0
        for slug, name, everfit_id in PROGRAMME_DEFINITIONS:
            programme = db.query(Programme).filter(Programme.slug == slug).first()
            if programme is None:
                programme = Programme(
                    slug=slug,
                    name=name,
                    description=f"{name} — assigned automatically by the onboarding rules engine.",
                    everfit_programme_id=everfit_id,
                    is_active=True,
                )
                db.add(programme)
                db.flush()
                programme_count += 1
            programme_by_slug[slug] = programme

        rule_count = 0
        for name, priority, conditions, programme_slug in RULE_DEFINITIONS:
            if db.query(AssignmentRule).filter(AssignmentRule.name == name).first() is not None:
                continue
            db.add(
                AssignmentRule(
                    name=name,
                    priority=priority,
                    conditions=conditions,
                    programme_id=programme_by_slug[programme_slug].id,
                    is_active=True,
                )
            )
            rule_count += 1

        if db.query(DiscountCode).filter(DiscountCode.code == "WELCOME10").first() is None:
            db.add(
                DiscountCode(
                    code="WELCOME10",
                    percent_off=10,
                    is_active=True,
                    max_redemptions=None,
                )
            )

        db.commit()
        print(
            f"Seeded {package_count} packages, {programme_count} programmes, "
            f"{rule_count} assignment rules."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()

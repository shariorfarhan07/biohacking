import enum


class MembershipStatus(str, enum.Enum):
    PENDING_PAYMENT = "pending_payment"
    ONBOARDING_PENDING = "onboarding_pending"
    ONBOARDING_COMPLETE = "onboarding_complete"
    PROVISIONING = "provisioning"
    PROVISIONED = "provisioned"
    PROVISIONING_FAILED = "provisioning_failed"
    PAYMENT_FAILED = "payment_failed"
    CANCELED = "canceled"
    REFUNDED = "refunded"


PIPELINE_ATTENTION_STATUSES = (
    MembershipStatus.PROVISIONING_FAILED,
    MembershipStatus.PAYMENT_FAILED,
)


class EverfitStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    CLIENT_CREATED = "client_created"
    PROGRAMME_ASSIGNED = "programme_assigned"
    ACTIVATED = "activated"
    FAILED = "failed"


class BillingInterval(str, enum.Enum):
    MONTHLY = "monthly"
    THREE_MONTH = "three_month"
    SIX_MONTH = "six_month"
    TWELVE_MONTH = "twelve_month"


class AdminRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"


class Goal(str, enum.Enum):
    FAT_LOSS = "fat_loss"
    MUSCLE_BUILDING = "muscle_building"
    RECOMPOSITION = "recomposition"
    PERFORMANCE = "performance"
    GENERAL_HEALTH = "general_health"


class TrainingLocation(str, enum.Enum):
    GYM = "gym"
    HOME = "home"
    HYBRID = "hybrid"


class ExperienceLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ContactStatus(str, enum.Enum):
    NEW = "new"
    READ = "read"
    RESOLVED = "resolved"


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"


class TicketAuthorType(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

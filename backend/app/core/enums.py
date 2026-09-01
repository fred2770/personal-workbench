from enum import Enum


class InboxItemType(str, Enum):
    TODO = "TODO"
    ISSUE = "ISSUE"
    BUG = "BUG"
    REQUIREMENT = "REQUIREMENT"
    FOLLOW_UP = "FOLLOW_UP"
    SITE_FEEDBACK = "SITE_FEEDBACK"
    MEMO = "MEMO"


class InboxItemStatus(str, Enum):
    INBOX = "INBOX"
    PROCESSED = "PROCESSED"
    ARCHIVED = "ARCHIVED"


class ProjectStatus(str, Enum):
    PLANNING = "PLANNING"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class ProjectPriority(str, Enum):
    HIGH = "HIGH"
    NORMAL = "NORMAL"
    LOW = "LOW"

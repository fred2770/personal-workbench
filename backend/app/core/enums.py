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

from django.db import models


class BaseModel(models.Model):
    """save() returns self, matching the MongoEngine Document.save() contract every
    serializer/test in this codebase was originally written against (Django's
    Model.save() returns None)."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        return self

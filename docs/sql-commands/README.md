# SQL Commands by Backend Folder

This project runs on MongoDB (Atlas) with MongoEngine, not SQL tables.
These files provide SQL-style equivalents to help you inspect and reason about data.

## Module Files

- [accounts.md](accounts.md)
- [core.md](core.md)
- [inventory.md](inventory.md)
- [process.md](process.md)
- [reports.md](reports.md)

## Notes

- Table names in these examples match Mongo collection names.
- UUID-like `unique_id` values are used as primary lookup keys in most APIs.
- Soft delete is modeled using `is_deleted = 0` in examples.
- Use these as reference commands for understanding data shape and relationships.

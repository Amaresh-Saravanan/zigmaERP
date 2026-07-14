"""Shared utilities for auto-ID generation across all apps."""


def next_entry_no(prefix, last_raw_id=None, fallback_last_num=0):
    """
    Generate the next zero-padded ID in the sequence.

    Args:
        prefix: Base prefix (e.g. 'EPC', 'FRP', 'EGG-SUP-' with trailing hyphen).
        last_raw_id: Last generated ID string (e.g. 'EPC-00005', 'PIT-PT-00001').
                     If None or empty, falls back to fallback_last_num.
        fallback_last_num: Numeric fallback if no last ID exists (default 0).

    Returns:
        Formatted ID string with pattern '{prefix}-{next_num:05d}' (5 digits zero-padded).

    Example:
        next_entry_no('EPC', 'EPC-00005') => 'EPC-00006'
        next_entry_no('EPC', fallback_last_num=10) => 'EPC-00011'
    """
    last_num = fallback_last_num
    if last_raw_id:
        try:
            last_num = int(last_raw_id.rsplit('-', 1)[-1])
        except (ValueError, IndexError):
            last_num = fallback_last_num
    return f'{prefix}-{last_num + 1:05d}'

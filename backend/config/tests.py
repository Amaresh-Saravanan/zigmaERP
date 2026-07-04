"""
Settings-level checks that need a fresh process (Django settings load once per
process, so these can't run inline in the main pytest-django process).
"""
import os
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def test_secret_key_required_when_debug_false():
    env = {**os.environ, 'DEBUG': 'False', 'SECRET_KEY': ''}
    result = subprocess.run(
        [sys.executable, 'manage.py', 'check'],
        cwd=BASE_DIR, env=env, capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert 'SECRET_KEY must be set' in result.stderr


def test_secret_key_placeholder_allowed_when_debug_true():
    env = {**os.environ, 'DEBUG': 'True', 'SECRET_KEY': ''}
    result = subprocess.run(
        [sys.executable, 'manage.py', 'check'],
        cwd=BASE_DIR, env=env, capture_output=True, text=True,
    )
    assert result.returncode == 0

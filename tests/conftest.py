import copy
import pytest
from fastapi.testclient import TestClient
from src import app as app_module

# Snapshot the application's initial activities so tests stay in sync
# with the defaults defined in src/app.py.
DEFAULT_ACTIVITIES = copy.deepcopy(app_module.activities)

@pytest.fixture(autouse=True)
def reset_activities():
    app_module.activities.clear()
    app_module.activities.update(copy.deepcopy(DEFAULT_ACTIVITIES))
    yield

@pytest.fixture
def client():
    return TestClient(app_module.app)

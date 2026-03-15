from fastapi.testclient import TestClient
from src import app


def test_get_activities(client: TestClient):
    resp = client.get('/activities')
    assert resp.status_code == 200
    data = resp.json()
    assert 'Chess Club' in data
    assert 'Programming Class' in data


def test_signup_success(client: TestClient):
    resp = client.post('/activities/Chess Club/signup?email=tester@mergington.edu')
    assert resp.status_code == 200
    assert 'Signed up' in resp.json()['message']


def test_signup_duplicate(client: TestClient):
    resp = client.post('/activities/Chess Club/signup?email=michael@mergington.edu')
    assert resp.status_code == 400
    assert 'already signed up' in resp.json()['detail']


def test_delete_participant_success(client: TestClient):
    resp = client.delete('/activities/Chess Club/participants?email=michael@mergington.edu')
    assert resp.status_code == 200
    assert 'Removed' in resp.json()['message']


def test_delete_participant_not_found(client: TestClient):
    resp = client.delete('/activities/Chess Club/participants?email=nonexistent@mergington.edu')
    assert resp.status_code == 404
    assert 'Participant not found' in resp.json()['detail']

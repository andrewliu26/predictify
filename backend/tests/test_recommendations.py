import requests
import time
import subprocess
import pytest

@pytest.fixture(scope="session", autouse=True)
def start_server():
    process = subprocess.Popen(["python", "app.py"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    time.sleep(5)
    yield
    process.terminate()

def test_recommendations_endpoint():
    track_id = "3GZD6HmiNUhxXYf8Gch723"
    url = f"http://127.0.0.1:5000/api/songs/recommendations/{track_id}"
    response = requests.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "songs" in data
    assert len(data["songs"]) > 0

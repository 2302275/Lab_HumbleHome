import requests
import os

os.environ["TESTING"] = "1"


def test_login_success():
    url = "http://localhost:5000/api/login"
    payload = {
        "login": "newuser@example.com",
        "password": "NewUserPass123!"
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_failure():
    url = "http://localhost:5000/api/login"
    payload = {
        "login": "wronguser@example.com",
        "password": "WrongPassword!"
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_register_new_user():
    url = "http://localhost:5000/api/register"
    payload = {
        "username": "newuser1234",
        "email": "newuser1234@example.com",
        "password": "NewUserPass1234!"
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_register_new_user_existing_email():
    url = "http://localhost:5000/api/register"
    payload = {
        "username": "existinguser",
        "login": "newuser@example.com",
        "password": "NewUserPass123!"
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 400
    assert "access_token" not in response.json()


def main():
    test_register_new_user()
    test_login_success()
    test_login_failure()
    test_register_new_user_existing_email()
    print("All tests passed!")


if __name__ == "__main__":
    main()
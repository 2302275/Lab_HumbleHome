import requests
import os

os.environ["TESTING"] = "1"


def test_login_success():
    url = "http://localhost/api/login"
    payload = {"login": "newuser@example.com", "password": "NewUserPass123!"}

    response = requests.post(url, json=payload)
    assert response.status_code == 200


def test_login_failure():
    url = "http://localhost/api/login"
    payload = {"login": "wronguser@example.com", "password": "WrongPassword!"}

    response = requests.post(url, json=payload)
    assert response.status_code == 401


def test_register_new_user():
    url = "http://localhost/api/register"
    payload = {
        "username": "newuser123456",
        "email": "newuser1234563@example.com",
        "password": "NewUserPass1234!",
    }

    response = requests.post(url, json=payload)
    print("Response:", response.json())  # This shows the actual error message


def test_register_new_user_existing_email():
    url = "http://localhost/api/register"
    payload = {
        "username": "existinguser123",
        "email": "newuser123@example.com",
        "password": "NewUserPass123!",
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 400


def main():
    test_register_new_user()
    test_login_success()
    test_login_failure()
    test_register_new_user_existing_email()
    print("All tests passed!")


if __name__ == "__main__":
    main()

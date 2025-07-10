import requests
import os

os.environ["TESTING"] = "1"


def test_login_success():
    url = "http://localhost/api/login"
    payload = {"login": "newuser1234@example.com", "password": "NewUserPass123!"}

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
        "username": "newuser1234",
        "email": "newuser@example.com",
        "password": "NewUserPass123!",
    }

    response = requests.post(url, json=payload)
    assert response.status_code == 201


def test_register_new_user_existing_email():
    url = "http://localhost/api/register"
    payload = {
        "username": "newuser1234",
        "email": "newuser1234@example.com",
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

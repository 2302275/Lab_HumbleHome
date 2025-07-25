import os
import time
import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

os.environ["TESTING"] = "1"


class EcommerceSiteTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = Options()
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--allow-insecure-localhost")
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        cls.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )
        cls.driver.implicitly_wait(10)
        cls.base_url = "http://localhost"
        cls.test_email = "newuser@example.com"
        cls.test_password = "NewUserPass123!"

    def test_04_test_homepage_products_displayed(self):
        try:
            self.driver.get(f"{self.base_url}/")
            self.assertIn("HumbleHome", self.driver.title)

            products = self.driver.find_elements(By.CLASS_NAME, "product-card")
            self.assertGreater(len(products), 0, "No products found on homepage")

        except Exception:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/homepage_products.png")
            with open("artifacts/homepage_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_01_test_register_new_user(self):
        try:
            self.driver.get(f"{self.base_url}/register")
            self.driver.find_element(By.NAME, "username").send_keys("newuser123")
            self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("NewUserPass123!")
            self.driver.find_element(By.CLASS_NAME, "register-btn").click()
            time.sleep(2)

            self.assertIn("Login", self.driver.page_source)

        except Exception:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/register_user.png")
            with open("artifacts/register_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_02_test_login_success(self):
        try:
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "login_input").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys(self.test_password)
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()
            time.sleep(2)

            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script(
                    "return localStorage.getItem('token') !== null"
                )
            )

            current_url = self.driver.current_url
            self.assertTrue(
                "/verify-otp" in current_url or current_url.endswith("/"),
                f"Unexpected redirect after login: {current_url}",
            )

        except Exception:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/login_success.png")
            with open("artifacts/login_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_03_test_login_failure(self):
        try:
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "login_input").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()
            time.sleep(2)

            current_url = self.driver.current_url
            self.assertIn(
                "/login",
                current_url,
                f"Expected to remain on login page, but got redirected to: "
                f"{current_url}",
            )

        except Exception:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/login_failure.png")
            with open("artifacts/login_failure_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()

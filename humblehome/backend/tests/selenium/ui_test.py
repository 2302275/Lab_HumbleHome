import os
import time
import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


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

    def test_homepage_products_displayed(self):
        try:
            self.driver.get(f"{self.base_url}/")
            # Check title contains your store name (adjust if needed)
            self.assertIn("HumbleHome", self.driver.title)

            # Check that product cards are displayed
            products = self.driver.find_elements(By.CLASS_NAME, "product-card")
            self.assertGreater(len(products), 0, "No products found on homepage")

        except Exception as e:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/homepage_products.png")
            with open("artifacts/homepage_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_register_new_user(self):
        try:
            self.driver.get(f"{self.base_url}/register")
            self.driver.find_element(By.NAME, "username").send_keys("newuser123")
            self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("NewUserPass123!")
            self.driver.find_element(By.CLASS_NAME, "register-btn").click()
            time.sleep(2)
            
            self.assertIn(
                "Login", self.driver.page_source
            )  

        except Exception as e:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/register_user.png")
            with open("artifacts/register_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_login_success(self):
        try:
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "login_input").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys(self.test_password)
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()
            time.sleep(2)

            self.assertIn("OTP", self.driver.page_source)

        except Exception as e:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/login_success.png")
            with open("artifacts/login_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    def test_login_failure(self):
        try:
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "email").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()
            time.sleep(2)

            self.assertIn("Invalid email or password", self.driver.page_source)

        except Exception as e:
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
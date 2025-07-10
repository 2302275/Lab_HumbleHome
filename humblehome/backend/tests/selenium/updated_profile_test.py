import os
import time
import unittest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

class ProfileEditTest(unittest.TestCase):
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

    def test_profile_page_edit(self):
        try:
            self.driver.get(f"{self.base_url}/register")
            self.driver.find_element(By.NAME, "username").send_keys("newuser123")
            self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("NewUserPass123!")
            self.driver.find_element(By.CLASS_NAME, "register-btn").click()
            time.sleep(2)
            
            # Step 1: Login
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "login_input").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys(self.test_password)
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()

            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script("return localStorage.getItem('token') !== null")
            )

            # Step 2: Go to profile page
            self.driver.get(f"{self.base_url}/profile")

            # Step 3: Wait for the profile tab to render
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Update Info') and contains(@class, 'text-orange-600')]"))
            )

            # Step 4: Fill in profile update form
            fullname_input = self.driver.find_element(By.NAME, "fullname")
            fullname_input.clear()
            fullname_input.send_keys("Test User Updated")

            phone_input = self.driver.find_element(By.NAME, "phonenumber")
            phone_input.clear()
            phone_input.send_keys("1234 5678")

            address_input = self.driver.find_element(By.NAME, "address")
            address_input.clear()
            address_input.send_keys("123 Updated Address")

            # Step 5: Submit form
            self.driver.find_element(By.XPATH, "//button[contains(text(),'Update Profile')]").click()
            time.sleep(2)  # Let backend update

            # Step 6: Check that update persisted
            self.driver.refresh()
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "fullname"))
            )

            updated_fullname = self.driver.find_element(By.NAME, "fullname").get_attribute("value")
            updated_phone = self.driver.find_element(By.NAME, "phonenumber").get_attribute("value")
            updated_address = self.driver.find_element(By.NAME, "address").get_attribute("value")

            self.assertEqual(updated_fullname, "Test User Updated")
            self.assertEqual(updated_phone, "1234 5678")
            self.assertEqual(updated_address, "123 Updated Address")

        except Exception as e:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/profile_edit_error.png")
            with open("artifacts/profile_edit_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

if __name__ == "__main__":
    unittest.main()

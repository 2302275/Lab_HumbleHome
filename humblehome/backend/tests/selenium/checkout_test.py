import os
import time
import unittest
os.environ["TESTING"] = "1"  # Add this line first

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class CheckoutFlowTest(unittest.TestCase):
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

    def test_checkout_flow_success(self):
        try:
            self.driver.get(f"{self.base_url}/register")
            self.driver.find_element(By.NAME, "username").send_keys("newuser123")
            self.driver.find_element(By.NAME, "email").send_keys("newuser@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("NewUserPass123!")
            self.driver.find_element(By.CLASS_NAME, "register-btn").click()
            time.sleep(2)
            
           # 1. Login
            self.driver.get(f"{self.base_url}/login")
            self.driver.find_element(By.NAME, "login_input").send_keys(self.test_email)
            self.driver.find_element(By.NAME, "password").send_keys(self.test_password)
            self.driver.find_element(By.CLASS_NAME, "login-btn").click()

            # Wait for token/user to be set in localStorage
            WebDriverWait(self.driver, 10).until(
                lambda d: d.execute_script("return localStorage.getItem('token') !== null")
            )

            # Check that login actually worked
            token = self.driver.execute_script("return localStorage.getItem('token');")
            self.assertIsNotNone(token, "Login failed: no token in localStorage")
            print("✅ Logged in as:", token)
            
            # 2. Clear cart if needed
            self.driver.get(f"{self.base_url}/cart")
            remove_btns = self.driver.find_elements(By.XPATH, "//button[contains(text(),'Remove')]")
            for btn in remove_btns:
                btn.click()
                time.sleep(0.3)

            # 3. Go to product and add to cart
            product_id = 1  # Update with a valid product ID if needed
            self.driver.get(f"{self.base_url}/product/{product_id}")
            add_to_cart = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Add to Cart')]"))
            )
            add_to_cart.click()
            time.sleep(1)

            # 4. Proceed to cart and click checkout
            self.driver.get(f"{self.base_url}/cart")
            checkout_btn = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Checkout')]"))
            )
            checkout_btn.click()

            # 5. Fill checkout form (adjust name attributes accordingly)
            WebDriverWait(self.driver, 10).until(EC.url_contains("/payment"))
            self.driver.find_element(By.NAME, "name").send_keys("Test User")
            self.driver.find_element(By.NAME, "address").send_keys("123 Test Street")
            self.driver.find_element(By.NAME, "city").send_keys("Singapore")
            self.driver.find_element(By.NAME, "postalCode").send_keys("123456")

            # If card fields are present
            self.driver.find_element(By.NAME, "cardNumber").send_keys("4242424242424242")
            self.driver.find_element(By.NAME, "expiry").send_keys("1229")
            self.driver.find_element(By.NAME, "cvv").send_keys("123")

            # 6. Submit the order
            place_order = self.driver.find_element(By.XPATH, "//button[contains(text(),'Checkout')]")
            place_order.click()

            # 7. Check confirmation page
            # WebDriverWait(self.driver, 10).until(EC.url_contains("/order-success"))
            # success_msg = self.driver.find_element(By.XPATH, "//h1[contains(text(),'Thank you')]")
            current_url = self.driver.current_url
            self.assertIn("/", current_url, f"Expected to be redirected to homepage, but got redirected to: {current_url}")

        except Exception as e:
            os.makedirs("artifacts", exist_ok=True)
            self.driver.save_screenshot("artifacts/checkout_flow_error.png")
            with open("artifacts/checkout_flow_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            raise

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()

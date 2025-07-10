import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Setup Chrome options for headless CI use
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Start Chrome using webdriver-manager (no Selenium Grid needed)
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
)

try:
    # Access your app (adjust to match where it's hosted in CI or locally)
    driver.get("http://localhost")  # or "http://nginx" if used in Docker Compose
    time.sleep(2)

    assert "HumbleHome" in driver.title

    products = driver.find_elements(By.CLASS_NAME, "product-card")
    assert len(products) > 0, "No products found"

    h1 = driver.find_element(By.TAG_NAME, "h1")
    print("Found heading:", h1.text)

except Exception as e:
    print("❌ Test failed:", e)
    os.makedirs("artifacts", exist_ok=True)
    driver.save_screenshot("artifacts/ui_test_error.png")
    raise

finally:
    driver.quit()
    print("🧹 Cleaned up Selenium driver.")

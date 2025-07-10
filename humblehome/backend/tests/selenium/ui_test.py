import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Remote(
    command_executor='http://selenium:4444/wd/hub',  # connect to selenium container, NOT localhost
    options=chrome_options
)

try:
    driver.get("http://nginx")  # or "http://localhost" if your app is accessible on localhost
    time.sleep(2)
    assert "HumbleHome" in driver.title

    products = driver.find_elements(By.CLASS_NAME, "product-card")
    assert len(products) > 0, "No products found"

    h1 = driver.find_element(By.TAG_NAME, "h1")
    print("Found heading:", h1.text)

except Exception as e:
    print("❌ Test failed:", e)
    driver.save_screenshot("ui_test_error.png")
    raise

finally:
    driver.quit()
    print("🧹 Cleaned up Selenium driver.")

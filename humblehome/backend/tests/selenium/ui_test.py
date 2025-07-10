import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# Set Chrome to run headless (no window)
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Connect to the Selenium server
driver = webdriver.Remote(
    command_executor='http://localhost:4444/wd/hub',
    options=chrome_options
)

try:
    driver.get("http://host.docker.internal")

    time.sleep(2)  # wait for the page to load

    # Check the page title
    assert "React App" in driver.title  # ← Change "React App" to match your actual title

    # Optional: find a heading
    h1 = driver.find_element(By.TAG_NAME, "h1")
    print("Found heading:", h1.text)

except Exception as e:
    print("❌ Test failed:", e)
    driver.save_screenshot("ui_test_error.png")
    raise

finally:
    driver.quit()
    print("🧹 Cleaned up Selenium driver.")
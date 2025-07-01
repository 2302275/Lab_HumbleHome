import logging
import os

def setup_logging():
    # Ensure log directory exists
    log_dir = '/app/logs'
    os.makedirs(log_dir, exist_ok=True)

    log_path = os.path.join(log_dir, 'app.log')

    logger = logging.getLogger('humblehome_logger')  # Custom logger
    logger.setLevel(logging.INFO)
    logger.propagate = False  # Allow propagation to the root logger

    # File handler
    file_handler = logging.FileHandler(log_path, mode='a')
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))

    # Console handler
    # console_handler = logging.StreamHandler()
    # console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

    # Avoid duplicate handlers
    if not logger.handlers:
        logger.addHandler(file_handler)
        # logger.addHandler(console_handler)
        
    return logger

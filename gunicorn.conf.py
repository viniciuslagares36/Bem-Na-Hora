
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = 2
accesslog = "-"
errorlog = "-"
worker_tmp_dir = "/dev/shm"

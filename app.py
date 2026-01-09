
from flask import Flask, send_from_directory
import os

try:
    from flask_mail import Mail
except ImportError:
    Mail = None

app = Flask(__name__, static_folder="static", template_folder="templates")

# Sessão e uploads (suas rotas usam session e UPLOAD_FOLDER)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["UPLOAD_FOLDER"] = os.path.join(app.static_folder, "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

mail = Mail(app) if Mail else None

# >>> ESSENCIAL: registrar rotas <<<
from routes import register_routes
register_routes(app, mail)

# Opcional: /health
@app.get("/health")
def health():
    return {"status": "ok"}, 200

# Se você mantém este handler manual, pode deixar
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

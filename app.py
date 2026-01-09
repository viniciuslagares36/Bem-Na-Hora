
# app.py
from flask import Flask, send_from_directory, render_template
import os

# Flask-Mail (opcional)
try:
    from flask_mail import Mail
except ImportError:
    Mail = None

app = Flask(__name__, static_folder="static", template_folder="templates")

# --- Configurações essenciais ---
# SECRET_KEY para usar sessão (session.*)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")

# Pasta de uploads (usada nas rotas de foto de perfil)
app.config["UPLOAD_FOLDER"] = os.path.join(app.static_folder, "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Configurar e inicializar Mail (se estiver usando envio de e-mail)
mail = None
if Mail:
    # Ajuste estas variáveis com seus dados de SMTP ou mantenha vazio para ignorar
    app.config["MAIL_SERVER"]   = os.environ.get("MAIL_SERVER", "")
    app.config["MAIL_PORT"]     = int(os.environ.get("MAIL_PORT", "587"))
    app.config["MAIL_USE_TLS"]  = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "")
    app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "")
    try:
        mail = Mail(app)
    except Exception as e:
        print("Flask-Mail não inicializado:", e)
        mail = None

# --- REGISTRAR ROTAS ---
from routes import register_routes
register_routes(app, mail)  # <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ESSENCIAL

# (Opcional) rota de saúde
@app.get("/health")
def health():
    return {"status": "ok"}, 200

# Se você ainda tem um handler manual de estáticos, pode manter:
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

# Apenas para desenvolvimento local
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

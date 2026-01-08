from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Configurações do Flask-Mail (protegido)
try:
    from flask_mail import Mail
    mail = Mail(app)
except ImportError:
    print("Flask-Mail não instalado")
    mail = None
except Exception as e:
    print("Flask-Mail não inicializado:", e)
    mail = None

# Rota principal de teste
@app.route("/")
def home():
    return "Bem Na Hora rodando! 🚀"

# Exemplo de rota de arquivos estáticos
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

# Exemplo de rota de teste /ping
@app.route("/ping")
def ping():
    return jsonify({"status": "pong"})

# Iniciar o app com host/porta configurados para o Railway
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
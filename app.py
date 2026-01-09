
from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route("/")
def home():
    # Se quiser, ainda pode passar variáveis como usuario_logado, tipo_usuario, etc.
    return render_template("index.html")

# health opcional
@app.get("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

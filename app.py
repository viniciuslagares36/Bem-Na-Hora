from flask import Flask
from flask_mail import Mail
import os
from routes import *
from routes import register_routes


app = Flask(__name__)

# --- CONFIG BASE ---
app.secret_key = 'chave_super_secreta'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# --- CONFIG EMAIL ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'BemNaHora.med@gmail.com'
app.config['MAIL_PASSWORD'] = 'scsn yacx kwxp vtod' #essa é a senha para de trocar a porra da senha: scsn yacx kwxp vtod
app.config['MAIL_DEFAULT_SENDER'] = 'BemNaHora.med@gmail.com'

mail = Mail(app)

# cria pasta upload
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Importa rotas
register_routes(app, mail)

if __name__ == '__main__':
    app.run(debug=True)

#utils.py
import random
import re
from datetime import datetime

# Mapeamento de convênios
MAPEAMENTO_CONVENIOS = {
    'Bradesco': 'Bradesco Saúde',
    'SulAmerica': 'SulAmérica',
    'Amil': 'Amil',
    'Unimed': 'Unimed',
    'Particular': 'Particular',
    'Cassi': 'Cassi',
    'Fusex': 'Fusex',
    'Nenhum': None
}

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def gerar_codigo():
    return str(random.randint(100000, 999999))

def limpar_cpf(cpf):
    return re.sub(r'\D', '', cpf)

def limpar_cnpj(cnpj):
    return re.sub(r'\D', '', cnpj)

def converter_data(data_str):
    try:
        partes = data_str.split('/')
        if len(partes) == 3:
            return f"{partes[2]}-{partes[1]}-{partes[0]}"
        return None
    except:
        return None

def formatar_data(data):
    try:
        if data:
            partes = str(data).split('-')
            if len(partes) == 3:
                return f"{partes[2]}/{partes[1]}/{partes[0]}"
        return None
    except:
        return None

def formatar_cpf(cpf):
    try:
        if cpf and len(cpf) == 11:
            return f"{cpf[0:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:11]}"
        return cpf
    except:
        return cpf

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
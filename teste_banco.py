import mysql.connector

print("1. Tentando conectar ao banco...")
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="senac", # A senha que você disse estar correta
        database="BemNaHora",
        port=3307
    )
    print("✅ Conexão com o banco SUCESSO!")
    
    cursor = conn.cursor()
    print("2. Verificando se a tabela 'usuario' existe...")
    try:
        cursor.execute("SELECT count(*) FROM usuario")
        print("✅ Tabela 'usuario' ENCONTRADA!")
    except mysql.connector.Error as err:
        print(f"❌ ERRO CRÍTICO: A tabela 'usuario' não existe ou está corrompida.\nErro: {err}")

    cursor.close()
    conn.close()

except mysql.connector.Error as err:
    print(f"❌ FALHA NA CONEXÃO: {err}")
    if "Access denied" in str(err):
        print("-> DICA: Sua senha 'senac' está errada para este PC.")
    elif "Unknown database" in str(err):
        print("-> DICA: O banco 'BemNaHora' não foi criado neste PC.")
    elif "Can't connect" in str(err):
        print("-> DICA: O MySQL (XAMPP/Workbench) não está rodando.")
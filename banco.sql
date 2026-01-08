-- tudo isso aqui é só pra exemplo

DROP SCHEMA IF EXISTS BemNaHora;
CREATE SCHEMA BemNaHora;
USE BemNaHora;

-- ==========================================================
-- 1. TABELAS DE APOIO GLOBAIS (CATÁLOGOS)
-- Estas tabelas são usadas tanto por clínicas quanto por profissionais
-- ==========================================================

-- Lista de Convênios (Amil, Unimed, etc)
CREATE TABLE convenios (
    idConvenio INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Lista de Infraestrutura (Wi-fi, Estacionamento) - Uso principal em Clínicas
CREATE TABLE comodidades (
    idComodidade INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    icone VARCHAR(50) DEFAULT 'fa-check'
);

-- Lista de Especialidades (Cardiologia, Dermatologia) - Uso Global
CREATE TABLE especialidades (
    idEspecialidade INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);


-- ==========================================================
-- 2. USUÁRIO (PACIENTE)
-- ==========================================================

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Identificação
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cpf VARCHAR(20) NOT NULL UNIQUE, 
    genero ENUM('M', 'F', 'O') NOT NULL,
    dataNasc DATE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    
    -- FOTO DE PERFIL (Nova coluna)
    foto_perfil VARCHAR(255), 
    
    -- Endereço
    cep VARCHAR(10),
    rua VARCHAR(150),
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    estado CHAR(2),
    
    -- Convênio Preferencial do Usuário
    idConvenio INT,
    FOREIGN KEY (idConvenio) REFERENCES convenios(idConvenio)
);

-- ==========================================================
-- 3. MÓDULO CLÍNICA (PJ)
-- ==========================================================

CREATE TABLE clinica (
    idClinica INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Login e Identificação
    nome VARCHAR(100) NOT NULL,           -- Razão Social
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,     
    
    -- Perfil Público
    nomeExibicao VARCHAR(100),            -- Nome Fantasia
    tipo VARCHAR(50),                     -- Ex: Multidisciplinar
    ano_fundacao INT,
    diretor_tecnico VARCHAR(100),
    registroTecnico VARCHAR(30),          -- CRM/CNES (Unificado)
    foto_perfil VARCHAR(255),             -- Caminho da imagem
    
    -- Redes Sociais
    site_url VARCHAR(150),
    instagram VARCHAR(100),
    
    -- Sobre
    historia TEXT,
    
    -- Localização e Contato
    endereco VARCHAR(200),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    telefone VARCHAR(20),                 
    
    -- Horários
    horario_semana VARCHAR(100),
    horario_fim_sem VARCHAR(100)
);

-- 3.1 Tabelas Filhas da Clínica (1:N)

CREATE TABLE equipe_medica (
    idEquipe INT PRIMARY KEY AUTO_INCREMENT,
    idClinica INT NOT NULL,
    nome VARCHAR(100),
    especialidade VARCHAR(100), -- Mantido VARCHAR para flexibilidade no cadastro rápido da clínica
    experiencia VARCHAR(50),
    
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE
);

CREATE TABLE procedimentos (
    idProcedimento INT PRIMARY KEY AUTO_INCREMENT,
    idClinica INT NOT NULL,
    nome VARCHAR(100),
    preco VARCHAR(50), 
    
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE
);

CREATE TABLE galeria_clinica (
    idFoto INT PRIMARY KEY AUTO_INCREMENT,
    idClinica INT NOT NULL,
    caminho_foto VARCHAR(255),
    legenda VARCHAR(45),
    
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE
);

-- 3.2 Tabelas de Ligação da Clínica (N:N)

CREATE TABLE clinica_convenios (
    idClinica INT,
    idConvenio INT,
    
    PRIMARY KEY (idClinica, idConvenio),
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE,
    FOREIGN KEY (idConvenio) REFERENCES convenios(idConvenio)
);

CREATE TABLE clinica_comodidades (
    idClinica INT,
    idComodidade INT,
    
    PRIMARY KEY (idClinica, idComodidade),
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE,
    FOREIGN KEY (idComodidade) REFERENCES comodidades(idComodidade)
);

-- ==========================================================
-- 4. MÓDULO PROFISSIONAL INDEPENDENTE 
-- ==========================================================

CREATE TABLE profissional (
    idProfissional INT PRIMARY KEY AUTO_INCREMENT,

    -- Dados de Acesso e Identificação
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(20) NOT NULL UNIQUE,       
    telefone VARCHAR(20),                  
    registro_conselho VARCHAR(50),         -- Ex: CRM-SP 123456

    -- Perfil Público
    foto_perfil VARCHAR(255),              
    biografia TEXT,
    formacao_academica TEXT,               -- Formação: "Curso - Instituição||Curso2 - Instituição2"

    -- Redes Sociais
    site_url VARCHAR(150),
    instagram VARCHAR(100),

    -- Local de Atendimento
    endereco VARCHAR(200),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),                        
    
    -- Horários
    horario_atendimento VARCHAR(150)       
);

-- 4.1 Tabelas Filhas do Profissional (1:N)

CREATE TABLE servicos_profissional (
    idServico INT PRIMARY KEY AUTO_INCREMENT,
    idProfissional INT NOT NULL,
    nome VARCHAR(100),              
    preco VARCHAR(50),              

    FOREIGN KEY (idProfissional) REFERENCES profissional(idProfissional) ON DELETE CASCADE
);

CREATE TABLE galeria_profissional (
    idFoto INT PRIMARY KEY AUTO_INCREMENT,
    idProfissional INT NOT NULL,
    caminho_foto VARCHAR(255),
    legenda VARCHAR(100),

    FOREIGN KEY (idProfissional) REFERENCES profissional(idProfissional) ON DELETE CASCADE
);

-- 4.2 Tabelas de Ligação do Profissional (N:N)

-- Aqui o profissional diz quais suas especialidades OFICIAIS (Cardiologia, Pediatria)
CREATE TABLE profissional_especialidade (
    idProfissional INT,
    idEspecialidade INT,

    PRIMARY KEY (idProfissional, idEspecialidade),
    FOREIGN KEY (idProfissional) REFERENCES profissional(idProfissional) ON DELETE CASCADE,
    FOREIGN KEY (idEspecialidade) REFERENCES especialidades(idEspecialidade)
);

CREATE TABLE profissional_convenios (
    idProfissional INT,
    idConvenio INT,

    PRIMARY KEY (idProfissional, idConvenio),
    FOREIGN KEY (idProfissional) REFERENCES profissional(idProfissional) ON DELETE CASCADE,
    FOREIGN KEY (idConvenio) REFERENCES convenios(idConvenio)
);
-- ==========================================================
-- 5. AGENDAMENTOS 
-- ==========================================================

CREATE TABLE agendamento (
    idAgendamento INT PRIMARY KEY AUTO_INCREMENT,
    
    -- QUEM É O PACIENTE?
    idUsuario INT NOT NULL,
    
    -- QUANDO?
    data_hora_inicio DATETIME NOT NULL, -- Ex: '2025-12-25 14:00:00'
    data_hora_fim DATETIME NOT NULL,    -- Ex: '2025-12-25 14:30:00' 
    
    -- QUAL A SITUAÇÃO?
    status ENUM('Agendado', 'Confirmado', 'Concluido', 'Cancelado', 'Faltou') DEFAULT 'Agendado',
    observacoes TEXT, -- Campo livre para "Paciente sente dores nas costas..."
    
    -- ======================================================
    -- LÓGICA HÍBRIDA (CLÍNICA OU PROFISSIONAL)
    -- Preenche-se um grupo OU o outro
    -- ======================================================
    
    -- CASO 1: É EM UMA CLÍNICA?
    idClinica INT,
    idEquipe INT,        -- Qual médico da equipe vai atender? (Vem do filtro do sidebar)
    idProcedimento INT,  -- Qual o serviço? (Ex: Consulta, Exame)
    
    -- CASO 2: É UM PROFISSIONAL INDEPENDENTE?
    idProfissional INT,
    idServico INT,       -- Qual o serviço? (Ex: Terapia, Nutrição)
    
    -- ======================================================
    -- CHAVES ESTRANGEIRAS
    -- ======================================================
    
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario) ON DELETE CASCADE,
    
    -- Links da Clínica
    FOREIGN KEY (idClinica) REFERENCES clinica(idClinica) ON DELETE CASCADE,
    FOREIGN KEY (idEquipe) REFERENCES equipe_medica(idEquipe) ON DELETE SET NULL, -- Se o médico sair, o histórico fica
    FOREIGN KEY (idProcedimento) REFERENCES procedimentos(idProcedimento) ON DELETE SET NULL,
    
    -- Links do Profissional
    FOREIGN KEY (idProfissional) REFERENCES profissional(idProfissional) ON DELETE CASCADE,
    FOREIGN KEY (idServico) REFERENCES servicos_profissional(idServico) ON DELETE SET NULL
);

-- ==========================================================
-- 6. MÓDULO DE AVALIAÇÕES (NOVO)
-- ==========================================================

CREATE TABLE avaliacoes (
    idAvaliacao INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Vínculo com o atendimento real (Garante "Compra Verificada")
    idAgendamento INT NOT NULL UNIQUE, 
    
    -- O conteúdo da avaliação
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5), -- Garante notas de 1 a 5
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave Estrangeira
    FOREIGN KEY (idAgendamento) REFERENCES agendamento(idAgendamento) ON DELETE CASCADE
);
-- ==========================================================
-- 7. INSERTS INICIAIS (Para teste)
-- ==========================================================

-- Popular Especialidades
INSERT INTO especialidades (nome) VALUES 
('Clínica Geral'), ('Cardiologia'), ('Dermatologia'), ('Ginecologia'), 
('Pediatria'), ('Ortopedia'), ('Psicologia'), ('Nutrição'), 
('Odontologia'), ('Fisioterapia');

-- Popular Convênios
INSERT INTO convenios (nome) VALUES 
('Particular'), ('Unimed'), ('Amil'), ('Bradesco Saúde'), ('SulAmérica');

-- Popular Comodidades
INSERT INTO comodidades (nome, icone) VALUES 
('Wi-Fi', 'fa-wifi'), ('Estacionamento', 'fa-parking'), ('Acessibilidade', 'fa-wheelchair');

-- ==========================================================
-- CONTAS TEMPORÁRIAS PARA TESTE (REMOVA APÓS USO)
-- OBS: troque/remoção obrigatória após testes
-- ==========================================================

-- (No temporary test accounts included in the committed SQL.)
-- If you need local test accounts, create them manually or via a protected setup script outside of version control.

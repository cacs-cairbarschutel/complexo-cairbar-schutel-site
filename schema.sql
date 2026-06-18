-- Schema para MySQL - CACS Site

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    image TEXT,
    author VARCHAR(255) DEFAULT 'Equipe CACS',
    status VARCHAR(20) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    slug VARCHAR(255) UNIQUE,
    tags TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Home Content
CREATE TABLE IF NOT EXISTS home_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_home_content_section ON home_content(section);

-- Dados Iniciais (Posts)
INSERT IGNORE INTO posts (id, title, description, content, image, author, status, created_at, published_at)
VALUES
  (
    2026031101,
    'Ações que Transformam',
    'Saiba como nossas campanhas de arrecadação estão impactando a comunidade local.',
    'Saiba como nossas campanhas de arrecadação estão impactando a comunidade local.<br><br>Cada doação, por menor que seja, tem o poder de transformar a realidade de famílias que se encontram em situação vulnerável.<br><br>Convidamos você a continuar apoiando nossos projetos e acompanhar de perto as histórias de superação que nascem a partir do nosso trabalho.',
    'assets/img/WhatsApp Image 2026-02-06 at 12.23.17.jpg',
    'Equipe CACS',
    'published',
    '2026-03-11 12:00:00',
    '2026-03-11 12:00:00'
  ),
  (
    2025112701,
    'Voluntariado em Foco',
    'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.',
    'Conheça as histórias das pessoas que doam seu tempo e talento para fazer a diferença.<br><br>O voluntariado é um dos pilares da nossa instituição, e sem a força dessas pessoas incríveis, não conseguiríamos realizar nem metade de nossos projetos.<br><br>Você já pensou em ser voluntário? Venha conhecer de perto as nossas instalações e se inspirar por aqueles que dedicam a vida por um mundo melhor.',
    'assets/img/WhatsApp Image 2025-11-27 at 19.04.09.jpg',
    'Equipe CACS',
    'published',
    '2025-11-27 12:00:00',
    '2025-11-27 12:00:00'
  ),
  (
    2025112401,
    'Saúde e Bem-estar no CDI',
    'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.',
    'Acompanhe o dia a dia e as atividades especiais promovidas para os idosos no Centro Dia.<br><br>Atividades recreativas, ginástica adaptada e oficinas de arte são algumas das práticas diárias que auxiliam no processo de convivência e qualidade de vida.<br><br>Acreditamos que o envelhecimento deve ser vivido com alegria, autonomia e, acima de tudo, muita dignidade e amor.',
    'assets/img/WhatsApp Image 2025-11-24 at 10.33.33 (3).jpg',
    'Equipe CDI',
    'published',
    '2025-11-24 12:00:00',
    '2025-11-24 12:00:00'
  );

-- Dados Iniciais (Home Content)
INSERT IGNORE INTO home_content (section, title, description, image_url)
VALUES
  (
    'hero',
    '63 anos de um trabalho de amor!',
    'O CACS | Complexo Assistencial Cairbar Schutel, organização filantrópica sem fins lucrativos, foi criado em 17 de janeiro de 1963 movido pela busca de uma sociedade mais justa e com mais oportunidades.',
    'assets/img/hero-bg.jpg'
  ),
  (
    'sobre',
    'CACS',
    'O CACS | Complexo Assistencial Cairbar Schutel, organização filantrópica sem fins lucrativos, fundado em 17 de janeiro de 1963, movido pela busca de uma sociedade mais justa e com mais oportunidades, trabalhando para resgatar a dignidade e fomentar a autonomia de pessoas em situação de vulnerabilidade.',
    'assets/img/Home-CACS.jpeg'
  ),
  (
    'acolhimento',
    'Programa de Acolhimento',
    'O Acolhimento Psicológico oferece atendimento gratuito para pessoas em situação de vulnerabilidade social em São Paulo, com psicólogos voluntários qualificados.',
    'assets/img/7. Acolhimento Psicológico.png'
  );

const fs = require('fs');

let c = fs.readFileSync('pages/transparencia.html', 'utf8');

const newMain = `<main>
        <!-- Seção Hero -->
        <section class="hero-page" style="background-image: url('../assets/img/CB2.jpg'); background-position: center; background-size: cover; padding: 100px 0; text-align: center; color: white; position: relative;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);"></div>
            <div class="container fade-in-up" style="position: relative; z-index: 1;">
                <h1 style="font-size: 3rem; margin-bottom: 20px;">Transparência</h1>
                <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto; padding: 0 20px;">Com o objetivo de cumprir a Lei de Acesso à Informação, disponibilizamos abaixo o Estatuto Social do CACS, juntamente com os documentos relacionados às atividades institucionais e aos demonstrativos financeiros.</p>
            </div>
        </section>

        <!-- Documentos Institucionais -->
        <section style="padding: 60px 0; background-color: #ffffff;">
            <div class="container fade-in-up text-center">
                <h3 style="color: var(--secondary-color); margin-bottom: 40px; font-size: 2rem;">Documentos Institucionais</h3>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/08/ESTATUTO-SOCIAL-CACS-03.2023.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📄 Estatuto Social
                    </a>
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/09/Manual-de-Conduta-e-Etica-CACS-2024-1.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📄 Manual de Conduta e Ética
                    </a>
                </div>
            </div>
        </section>

        <!-- Relatórios e Balanços -->
        <section style="padding: 60px 0; background-color: var(--secondary-color); color: white;">
            <div class="container fade-in-up text-center">
                <h3 style="color: var(--primary-color); margin-bottom: 40px; font-size: 2rem;">Relatórios de Atividades e Balanços</h3>
                
                <h4 style="margin-bottom: 20px; font-size: 1.5rem;">2024</h4>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-bottom: 40px;">
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2025/04/Relatorio-de-Atividades-CACS.pdf" target="_blank" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--secondary-color);">
                        📊 Relatório de Atividades 2024
                    </a>
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2025/04/DRE-2024.pdf" target="_blank" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--secondary-color);">
                        📈 Balanço Anual 2024
                    </a>
                </div>

                <h4 style="margin-bottom: 20px; font-size: 1.5rem; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); max-width: 300px; margin-left: auto; margin-right: auto;">2023</h4>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/09/Relatorio-de-Atividades-CACS-2023_final.pdf" target="_blank" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--secondary-color);">
                        📊 Relatório de Atividades 2023
                    </a>
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/08/BALANCO-2023.pdf" target="_blank" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--secondary-color);">
                        📈 Balanço Anual 2023
                    </a>
                </div>
            </div>
        </section>

        <!-- Auditoria Financeira -->
        <section style="padding: 60px 0; background-color: #f9f9f9;">
            <div class="container fade-in-up text-center">
                <h3 style="color: var(--secondary-color); margin-bottom: 20px; font-size: 2rem;">Auditoria Financeira Independente</h3>
                <p style="color: #666; max-width: 800px; margin: 0 auto 40px auto; font-size: 1.1rem;">Com forte compromisso em manter a transparência em nossa gestão de recursos, o CACS passa por auditorias anuais realizadas por empresas independentes. Atualmente, a auditoria é executada pelo <strong>GRUPO GORIOUX</strong>.</p>
                
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2025/08/Relatorio-dos-Auditores-31-12-2023c-1.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📉 Auditoria Financeira 2023
                    </a>
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/08/Relatorio_dos_auditores_independentes_2022-1.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📉 Auditoria Financeira 2022
                    </a>
                    <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/08/Relatorio_dos_auditores_independentes_2021-1.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        📉 Auditoria Financeira 2021
                    </a>
                </div>
            </div>
        </section>

        <!-- Convênios Municipais e Emendas -->
        <section style="padding: 60px 0; background-color: #ffffff;">
            <div class="container fade-in-up text-center">
                <h3 style="color: var(--secondary-color); margin-bottom: 40px; font-size: 2rem;">Convênios Municipais e Emendas Parlamentares</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto;">
                    
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 15px; font-size: 1.3rem;">Emenda Parlamentar - 2024</h4>
                        <p style="margin-bottom: 8px;"><strong>Parlamentar:</strong> Delegado Olim</p>
                        <p style="margin-bottom: 8px;"><strong>Processo nº:</strong> 2024.032.60680</p>
                        <p style="margin-bottom: 8px;"><strong>Objeto:</strong> Obras</p>
                        <p style="margin-bottom: 8px;"><strong>Secretaria:</strong> Desenvolvimento Social</p>
                        <p style="margin-bottom: 8px;"><strong>Valor:</strong> R$ 200.000,00</p>
                        <p style="margin-bottom: 0;"><strong>Tipo:</strong> Emenda LOA</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 15px; font-size: 1.3rem;">Emenda Parlamentar - 2023</h4>
                        <p style="margin-bottom: 8px;"><strong>Parlamentar:</strong> Delegado Olim</p>
                        <p style="margin-bottom: 8px;"><strong>Processo nº:</strong> 2023.032.50340</p>
                        <p style="margin-bottom: 8px;"><strong>Objeto:</strong> Obras</p>
                        <p style="margin-bottom: 8px;"><strong>Secretaria:</strong> Desenvolvimento Social</p>
                        <p style="margin-bottom: 8px;"><strong>Valor:</strong> R$ 100.000,00</p>
                        <p style="margin-bottom: 0;"><strong>Tipo:</strong> Emenda LOA</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 15px; font-size: 1.3rem;">Emenda Parlamentar - 2022</h4>
                        <p style="margin-bottom: 8px;"><strong>Parlamentar:</strong> Delegado Olim</p>
                        <p style="margin-bottom: 8px;"><strong>Processo nº:</strong> 2022.032.40119</p>
                        <p style="margin-bottom: 8px;"><strong>Objeto:</strong> Custeio</p>
                        <p style="margin-bottom: 8px;"><strong>Secretaria:</strong> Desenvolvimento Social</p>
                        <p style="margin-bottom: 8px;"><strong>Valor:</strong> R$ 80.000,00</p>
                        <p style="margin-bottom: 0;"><strong>Tipo:</strong> Emenda LOA</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; border-left: 4px solid var(--primary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 15px; font-size: 1.3rem;">Termo de Colaboração (SMADS) - 2021</h4>
                        <p style="margin-bottom: 8px;"><strong>Termo:</strong> 088/SMADS/2021</p>
                        <p style="margin-bottom: 8px;"><strong>Objeto:</strong> Centro Dia Para Idoso</p>
                        <p style="margin-bottom: 8px;"><strong>Valor do Repasse:</strong> R$ 102.084,14</p>
                        <p style="margin-bottom: 0;"><strong>Vigência:</strong> 01/04/2021 a 31/03/2026</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Politica de Privacidade LGPD -->
        <section style="padding: 60px 0; background-color: var(--bg-light); border-top: 1px solid #ddd;">
            <div class="container fade-in-up text-center">
                <h3 style="color: var(--secondary-color); margin-bottom: 20px; font-size: 2rem;">Política de Privacidade</h3>
                <p style="color: #666; margin-bottom: 30px; font-size: 1.1rem;">Consulte como gerenciamos e protegemos seus dados.</p>
                <a href="https://wp.cacs-cairbarschutel.org.br/wp-content/uploads/2024/09/Politica-de-Privacidade-LGPD-CACS-2024-1-1.pdf" target="_blank" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem; display: inline-flex; align-items: center; justify-content: center; gap: 10px;">
                    📄 Política de Privacidade - LGPD
                </a>
            </div>
        </section>

        <!-- Chamada para Ação -->
        <section class="cta-section" id="faca-parte">
            <div class="container">
                <div class="cta-box fade-in-up">
                    <h2>Faça parte dessa causa</h2>
                    <div class="links-wrapper">
                        <a href="doacao.html" class="btn btn-secondary">Como apoiar</a>
                        <a href="../index.html#contato" class="btn btn-secondary">Fale conosco</a>
                    </div>
                </div>
            </div>
        </section>
    </main>`;

c = c.replace(/<main>[\s\S]*<\/main>/, newMain);

// Fix page title 
c = c.replace(/<title>.*?<\/title>/, '<title>Transparência - CACS</title>');

fs.writeFileSync('pages/transparencia.html', c);
console.log('Update Complete.');

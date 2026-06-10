# Visão Geral — Documentação da Área Administrativa

Esta documentação descreve a camada administrativa da plataforma **PulviOn**, responsável por transformar os registros de campo em visão de gestão. O painel administrativo PulviOn consolida os dados coletados no app de campo e os apresenta de forma organizada para gestores e administradores.

## Documentos incluídos
1. `admin_prd.md`
   - requisitos do painel administrativo;
   - objetivos, funcionalidades e escopo.

2. `admin_google_sheets_integration.md`
   - arquitetura da integração entre Supabase e Google Sheets;
   - fluxo de sincronização, regras e tratamento de falhas.

3. `admin_monitoring_farm_pilot.md`
   - módulo analítico para acompanhamento por fazenda e piloto;
   - filtros, métricas e layout sugerido.

## Relação com o projeto principal
- O app mobile continua como coletor de dados.
- O Supabase permanece como base central.
- O painel ADM da PulviOn passa a ser a camada de gestão para administradores e gestores.
- O Google Sheets continua como espelho operacional e apoio administrativo.


# 🛡️ Sentinela PMSP - Preparatório Militar de Elite

O **Sentinela PMSP** é uma aplicação web progressiva (PWA) de alta performance, desenvolvida para auxiliar candidatos na preparação estratégica para o concurso de Soldado da Polícia Militar do Estado de São Paulo.

## 🚀 Funcionalidades Principais

- **🎖️ Tutor de IA (Sargento):** Um instrutor virtual baseado no Gemini que tira dúvidas sobre o edital e as matérias em tempo real.
- **📝 Simulados Dinâmicos:** Geração automática de questões padrão VUNESP com correção tática imediata.
- **📅 Escala de Serviço (Agenda):** Sistema de cronograma de estudos com notificações de alerta de prontidão.
- **📊 Radar do Concurso:** Busca automática de notícias oficiais, editais e atualizações do Diário Oficial via IA.
- **📈 Relatório de Campo:** Estatísticas detalhadas de desempenho e matriz de proficiência por matéria.
- **📸 Perfil Customizável:** Identidade militar com upload de foto, modo tático (Dark Mode) e conquistas.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19 + Tailwind CSS
- **Inteligência Artificial:** Google Gemini API (@google/genai)
- **Infraestrutura PWA:** Service Workers para suporte offline e Web Manifest para instalação mobile.
- **Voz:** Integração com Gemini Text-to-Speech (TTS) para comandos de voz do Sargento.

## 📦 Como Rodar Localmente

1. Clone o repositório.
2. Certifique-se de ter um servidor local (como a extensão Live Server do VS Code) ou hospede em plataformas como Vercel/Netlify.
3. O app utiliza a API do Gemini. A chave é injetada via ambiente em `process.env.API_KEY`.

## 📱 Gerando o APK para Android

Este projeto foi configurado com `manifest.json` e `capacitor.config.json` para facilitar a conversão:
1. Faça o deploy da aplicação para uma URL pública.
2. Utilize o [PWA Builder](https://www.pwabuilder.com/) para gerar o pacote `.apk` ou `.aab` para a Play Store.

## 📜 Licença e Aviso Legal
Este é um projeto educativo. O **Sentinela PMSP** não possui vínculo oficial com a Polícia Militar do Estado de São Paulo ou com a banca VUNESP.

---
**Missão Dada é Missão Cumprida!** 🫡👮‍♂️

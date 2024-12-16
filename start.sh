#!/bin/bash

# Carregar variáveis de ambiente
source .env

# Verificar Redis
redis-cli ping > /dev/null
if [ $? -ne 0 ]; then
    echo "Redis não está rodando. Iniciando Redis..."
    sudo service redis-server start
fi

# Iniciar servidor de webhooks
pm2 start server/webhookServer.ts --name webhook-server

# Iniciar aplicação principal
pm2 start npm --name crm -- start

# Salvar configuração do PM2
pm2 save

echo "Servidores iniciados com sucesso!"
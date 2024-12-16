export function getBaseUrl(): string {
  // Em produção, use a URL configurada ou detecte automaticamente
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || window.location.origin;
  }

  // Em desenvolvimento, use localhost com a porta do Express
  return `http://localhost:${import.meta.env.VITE_PORT || 3000}`;
}

export function getWebhookUrl(): string {
  return `${getBaseUrl()}/webhook`;
}
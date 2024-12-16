import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/auth';
import { Button } from '../components/ui/Button';
import { RateLimiter } from '../services/auth/rateLimiter';

const REDIRECT_DELAY = 1500; // 1.5 segundos para redirecionamento

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isAuthenticated } = useAuth();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  useEffect(() => {
    // Verifica se há bloqueio ativo
    const blockUntil = localStorage.getItem('loginBlockUntil');
    if (blockUntil) {
      const remainingTime = parseInt(blockUntil) - Date.now();
      if (remainingTime > 0) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(remainingTime / 1000));
      } else {
        localStorage.removeItem('loginBlockUntil');
        setAttempts(0);
      }
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (isBlocked && blockTimeRemaining > 0) {
      timer = window.setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('loginBlockUntil');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimeRemaining]);

  const handleBlockUser = () => {
    const blockDuration = Math.min(Math.pow(2, attempts) * 30, 3600); // Max 1 hora
    const blockUntil = Date.now() + blockDuration * 1000;
    localStorage.setItem('loginBlockUntil', blockUntil.toString());
    setIsBlocked(true);
    setBlockTimeRemaining(blockDuration);
  };

  const formatBlockTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔵 Login: Starting login submission');
    setError('');

    if (isBlocked) {
      const timeStr = formatBlockTime(blockTimeRemaining);
      console.log('❌ Login: Login blocked:', timeStr);
      setError(`Muitas tentativas. Tente novamente em ${timeStr}`);
      return;
    }
    
    // Verifica rate limit antes de tentar login
    const rateLimit = RateLimiter.checkRateLimit(email);
    console.log('🔵 Login: Rate limit check:', rateLimit);
    
    if (!rateLimit.allowed) {
      const timeStr = formatBlockTime(rateLimit.waitTime || 1);
      console.log('❌ Login: Rate limit exceeded');
      setError(`Muitas tentativas. Tente novamente em ${timeStr} (${rateLimit.remainingAttempts} ${
        rateLimit.remainingAttempts === 1 ? 'tentativa restante' : 'tentativas restantes'
      })`);
      return;
    }

    // Validações básicas
    if (!email.trim() || !password.trim()) {
      console.log('❌ Login: Empty fields');
      setError('Preencha todos os campos');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      console.log('❌ Login: Invalid email format');
      setError('Email inválido');
      return;
    }

    if (password.length < 6) {
      console.log('❌ Login: Password too short');
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setError('');
    setIsLoading(true);
    console.log('🔵 Login: Attempting login with email:', email);

    try {
      await login(email, password);
      console.log('✅ Login: Login successful');
      setSuccess(true);
      setPassword('');
      setAttempts(0);
      localStorage.removeItem('loginBlockUntil');
      
      setTimeout(() => {
        console.log('🔵 Login: Redirecting to home');
        navigate('/');
      }, REDIRECT_DELAY);

    } catch (err) {
      console.error('❌ Login: Login failed:', err);
      setAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 5) { // Aumentado para 5 tentativas
          console.log('❌ Login: Too many attempts, blocking user');
          handleBlockUser(); 
        }
        return newAttempts;
      });
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erro ao fazer login. Verifique suas credenciais.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🔵 Login: Login attempt completed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            WhatsApp CRM
          </h1>
          <p className="text-gray-600 mt-2">
            {success ? 'Login realizado com sucesso!' : 'Faça login para continuar'}
          </p>
        </div>

        {success ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecionando...
          </div>
        ) : error ? (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Erro</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{error}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-400
                  transition-colors"
                placeholder="seu@email.com"
                required
                disabled={isLoading || isBlocked || success}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-400
                  transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading || isBlocked || success}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
            </label>

            <a
              href="#"
              className="text-sm text-black hover:text-gray-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implementar recuperação de senha
                alert('Funcionalidade em desenvolvimento');
              }}
            >
              Esqueceu a senha?
            </a>
          </div>
          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-all
              transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50
              disabled:cursor-not-allowed disabled:hover:scale-100"
            isLoading={isLoading}
            disabled={isLoading || isBlocked || success}
          >
            {isLoading ? 'Entrando...' : success ? 'Sucesso!' : 'Entrar'}
          </Button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <a href="#" className="text-black hover:text-gray-600 transition-colors font-medium">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
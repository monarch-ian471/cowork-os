import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, UserPlus, LogIn, User as UserIcon } from 'lucide-react';
import { User, Role } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Internal type for storage including password
interface StoredUser extends User {
  password?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('ADMIN_OPS');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Seed default users on first load
  useEffect(() => {
    const existingData = localStorage.getItem('cowork_os_users');
    if (!existingData) {
      const defaultUsers: StoredUser[] = [
        { id: '1', username: 'admin', password: 'admin123', role: 'ADMIN_OPS', name: 'Operations Admin' },
        { id: '2', username: 'finance', password: 'money123', role: 'ADMIN_FINANCE', name: 'Finance Controller' }
      ];
      localStorage.setItem('cowork_os_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('cowork_os_users') || '[]');

    if (isRegistering) {
      // REGISTER LOGIC
      if (!username || !password || !name) {
        setError('All fields are required.');
        return;
      }
      
      if (storedUsers.some(u => u.username === username)) {
        setError('Username already exists.');
        return;
      }

      const newUser: StoredUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        name,
        role
      };

      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('cowork_os_users', JSON.stringify(updatedUsers));
      
      setSuccess('Account created successfully. Please log in.');
      setIsRegistering(false);
      setPassword(''); // clear password for login
    } else {
      // LOGIN LOGIC
      const validUser = storedUsers.find(u => u.username === username && u.password === password);
      
      if (validUser) {
        // Remove password before passing to app state
        const { password, ...userSafe } = validUser;
        onLogin(userSafe as User);
      } else {
        setError('Invalid credentials. Access Denied.');
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-dark border border-brand-surface p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-transparent"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-red/20">
            {isRegistering ? (
               <UserPlus className="w-8 h-8 text-brand-red" />
            ) : (
               <ShieldCheck className="w-8 h-8 text-brand-red" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CoWork OS</h1>
          <p className="text-brand-gray mt-2 text-sm">
            {isRegistering ? 'Create Administrative Access' : 'Secure Space Management'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-brand-gray uppercase mb-2">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-black border border-brand-surface text-white p-3 pl-10 rounded-lg focus:ring-2 focus:ring-brand-red outline-none transition-all placeholder:text-brand-surface"
                    placeholder="e.g. John Doe"
                  />
                  <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-brand-gray" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gray uppercase mb-2">Role Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN_OPS')}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${role === 'ADMIN_OPS' ? 'bg-brand-red text-white border-brand-red' : 'bg-brand-black text-brand-gray border-brand-surface hover:border-brand-gray'}`}
                  >
                    Operations
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN_FINANCE')}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${role === 'ADMIN_FINANCE' ? 'bg-brand-red text-white border-brand-red' : 'bg-brand-black text-brand-gray border-brand-surface hover:border-brand-gray'}`}
                  >
                    Finance
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-gray uppercase mb-2">System ID (Username)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded-lg focus:ring-2 focus:ring-brand-red outline-none transition-all placeholder:text-brand-surface"
              placeholder={isRegistering ? "Choose a username" : "Enter username"}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-brand-gray uppercase mb-2">Access Key (Password)</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded-lg focus:ring-2 focus:ring-brand-red outline-none transition-all placeholder:text-brand-surface"
                placeholder="••••••••"
              />
              <Lock className="absolute right-3 top-3.5 w-5 h-5 text-brand-surface" />
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-950/30 border border-brand-red/30 text-brand-red text-sm rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-500 text-sm rounded-lg text-center">
              {success}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
          >
            {isRegistering ? (
              <>Create Account</>
            ) : (
              <>Authenticate <LogIn className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-brand-surface">
          <button 
            onClick={toggleMode}
            className="text-brand-gray hover:text-white text-sm transition-colors"
          >
            {isRegistering ? (
              <>Already have an ID? <span className="text-brand-red font-bold underline decoration-brand-red/30 underline-offset-4">Log In</span></>
            ) : (
              <>Need access? <span className="text-brand-red font-bold underline decoration-brand-red/30 underline-offset-4">Create Account</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({setUser}) {
    // Form Variables
    const [password, setPassword] = useState('');
    const [login, setLogin] = useState('');

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            setUser(data.user);
            localStorage.setItem('token', data.token);
            setMessage('Login successful');
            navigate('/'); 
        } else {
            setMessage(data.message);
        }
    };

    return (
       <div className="py-10 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                {message.text && (
                    <p className={`text-center text-sm mt-4 mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {message.text}
                    </p>
                )}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username or email"
                        value={login}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className={`w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600
                        `}
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-sm mt-6">
                Don't have an account?{' '}
                <a href="/register" className="text-black underline">Create one</a>
                </p>
            </div>
        </div>
    );
}

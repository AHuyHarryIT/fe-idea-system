import React, { useState } from 'react'
import { CiCircleAlert } from 'react-icons/ci'
import { FaGraduationCap } from 'react-icons/fa6'

interface LoginProps {
  onLogin: (role: 'staff' | 'qa_coordinator' | 'qa_manager' | 'admin') => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    console.log('Attempting login with', { username, password })

    // Mock authentication logic
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    // Demo credentials
    if (username === 'admin' && password === 'admin') {
      onLogin('admin')
    } else if (username === 'manager' && password === 'manager') {
      onLogin('qa_manager')
    } else if (username === 'coordinator' && password === 'coordinator') {
      onLogin('qa_coordinator')
    } else if (username === 'staff' && password === 'staff') {
      onLogin('staff')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl mb-2 text-slate-800">
              University Idea Collection System
            </h1>
            <p className="text-slate-500">Sign in to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <CiCircleAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm mb-2 text-slate-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-slate-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Staff: staff / staff</p>
              <p>QA Coordinator: coordinator / coordinator</p>
              <p>QA Manager: manager / manager</p>
              <p>Administrator: admin / admin</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 University. All rights reserved.
        </p>
      </div>
    </div>
  )
}

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { User, AuthResponse } from "@/types"
import { authApi } from "@/api/auth.api"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: AuthResponse) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("admin_user")
    return saved ? JSON.parse(saved) : null
  })
  
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem("admin_token")
  )

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("admin_token")
        if (savedToken) {
          setToken(savedToken)
        }
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem("admin_token", token)
    } else {
      localStorage.removeItem("admin_token")
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem("admin_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("admin_user")
    }
  }, [user])

  const login = (data: AuthResponse) => {
    setUser(data.user)
    setToken(data.accessToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    authApi.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ADMIN",
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

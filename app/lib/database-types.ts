// This file would typically be generated from your database schema
// or defined manually to match your database structure

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "user"
  status: "active" | "inactive" | "pending"
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  createdAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  target: string
  timestamp: string
  user?: User
}

export interface DatabaseSchema {
  users: User[]
  products: Product[]
  activity_logs: ActivityLog[]
}

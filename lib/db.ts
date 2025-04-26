import { query } from "./db-connection"
import type { DatabaseSchema, Product, User, ActivityLog } from "./database-types"

// Real database implementation
export class Database {
  // Get all products
  async getAll<T extends keyof DatabaseSchema>(table: T): Promise<DatabaseSchema[T]> {
    try {
      const { rows } = await query(`SELECT * FROM ${table} ORDER BY "createdAt" DESC`)
      return rows as DatabaseSchema[T]
    } catch (error) {
      console.error(`Error fetching all records from ${table}:`, error)
      throw error
    }
  }

  // Get a single item by ID
  async getById<T extends keyof DatabaseSchema>(table: T, id: string): Promise<DatabaseSchema[T][number] | null> {
    try {
      const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
      return rows.length > 0 ? (rows[0] as DatabaseSchema[T][number]) : null
    } catch (error) {
      console.error(`Error fetching record from ${table} with ID ${id}:`, error)
      throw error
    }
  }

  // Create a new product
  async create<T extends keyof DatabaseSchema>(
    table: T,
    data: Omit<DatabaseSchema[T][number], "id" | "createdAt">,
  ): Promise<DatabaseSchema[T][number]> {
    try {
      // Generate column names and placeholders for the query
      const columns = Object.keys(data).join(", ")
      const placeholders = Object.keys(data)
        .map((_, index) => `$${index + 1}`)
        .join(", ")
      const values = Object.values(data)

      // Execute the query
      const { rows } = await query(
        `INSERT INTO ${table} (${columns}, "createdAt") 
         VALUES (${placeholders}, NOW()) 
         RETURNING *`,
        [...values],
      )

      return rows[0] as DatabaseSchema[T][number]
    } catch (error) {
      console.error(`Error creating record in ${table}:`, error)
      throw error
    }
  }

  // Update a product
  async update<T extends keyof DatabaseSchema>(
    table: T,
    id: string,
    data: Partial<DatabaseSchema[T][number]>,
  ): Promise<DatabaseSchema[T][number] | null> {
    try {
      // Generate SET clause for the query
      const setClause = Object.keys(data)
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ")
      const values = [...Object.values(data), id]

      // Execute the query
      const { rows } = await query(
        `UPDATE ${table} 
         SET ${setClause} 
         WHERE id = $${values.length} 
         RETURNING *`,
        values,
      )

      return rows.length > 0 ? (rows[0] as DatabaseSchema[T][number]) : null
    } catch (error) {
      console.error(`Error updating record in ${table} with ID ${id}:`, error)
      throw error
    }
  }

  // Delete a product
  async delete<T extends keyof DatabaseSchema>(table: T, id: string): Promise<boolean> {
    try {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [id])
      return rowCount > 0
    } catch (error) {
      console.error(`Error deleting record from ${table} with ID ${id}:`, error)
      throw error
    }
  }

  // Get activity logs with user data
  async getActivityLogs(): Promise<(ActivityLog & { user: User })[]> {
    try {
      const { rows } = await query(`
        SELECT a.*, u.name, u.email, u.role, u.status
        FROM activity_logs a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.timestamp DESC
      `)

      // Transform the result to match the expected format
      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        target: row.target,
        timestamp: row.timestamp,
        user: {
          id: row.user_id,
          name: row.name,
          email: row.email,
          role: row.role,
          status: row.status,
          createdAt: row.created_at,
        },
      }))
    } catch (error) {
      console.error("Error fetching activity logs with user data:", error)
      throw error
    }
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      if (!query) {
        return this.getAll("products")
      }

      const { rows } = await query(
        `SELECT * FROM products 
         WHERE name ILIKE $1 OR category ILIKE $1 
         ORDER BY "createdAt" DESC`,
        [`%${query}%`],
      )

      return rows as Product[]
    } catch (error) {
      console.error("Error searching products:", error)
      throw error
    }
  }

  // Get product statistics
  async getProductStatistics() {
    try {
      // Total products
      const { rows: totalProductsRows } = await query("SELECT COUNT(*) as count FROM products")
      const totalProducts = Number.parseInt(totalProductsRows[0].count)

      // Total stock
      const { rows: totalStockRows } = await query("SELECT SUM(stock) as total FROM products")
      const totalStock = Number.parseInt(totalStockRows[0].total || "0")

      // Total value
      const { rows: totalValueRows } = await query("SELECT SUM(price * stock) as total FROM products")
      const totalValue = Number.parseFloat(totalValueRows[0].total || "0")

      // Category counts
      const { rows: categoryRows } = await query(`
        SELECT category, COUNT(*) as count 
        FROM products 
        GROUP BY category
      `)

      const categoryCounts = categoryRows.reduce(
        (acc, row) => {
          acc[row.category] = Number.parseInt(row.count)
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        totalProducts,
        totalStock,
        totalValue,
        categoryCounts,
      }
    } catch (error) {
      console.error("Error fetching product statistics:", error)
      throw error
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      // Total users
      const { rows: totalUsersRows } = await query("SELECT COUNT(*) as count FROM users")
      const totalUsers = Number.parseInt(totalUsersRows[0].count)

      // Role distribution
      const { rows: roleRows } = await query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `)

      const roleDistribution = roleRows.reduce(
        (acc, row) => {
          acc[row.role] = Number.parseInt(row.count)
          return acc
        },
        {} as Record<string, number>,
      )

      // Status distribution
      const { rows: statusRows } = await query(`
        SELECT status, COUNT(*) as count 
        FROM users 
        GROUP BY status
      `)

      const statusDistribution = statusRows.reduce(
        (acc, row) => {
          acc[row.status] = Number.parseInt(row.count)
          return acc
        },
        {} as Record<string, number>,
      )

      // Monthly user growth (using registration dates)
      const { rows: growthRows } = await query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
          COUNT(*) as count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `)

      return {
        totalUsers,
        roleDistribution,
        statusDistribution,
        userGrowth: growthRows.map((row) => ({
          month: row.month,
          count: Number.parseInt(row.count),
        })),
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error)
      throw error
    }
  }
}

// Export a singleton instance
export const db = new Database()

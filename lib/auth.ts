import { db } from "./db"

// Function to authenticate a user
export async function authenticateUser(email: string, password: string) {
  try {
    // In a real application, you would query your database for the user
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (rows.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = rows[0]

    // In a real application, you would hash the password and compare it
    // const passwordMatch = await compare(password, user.password_hash)

    // For this example, we'll just check if the password is "password"
    const passwordMatch = password === "password"

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    // Log the login activity
    await db.create("activity_logs", {
      userId: user.id,
      action: "logged in",
      target: "",
    })

    // Return the user without the password hash
    const { password_hash, ...userWithoutPassword } = user

    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "An error occurred during authentication" }
  }
}

// Function to get the current user from a session
export async function getCurrentUser(userId: string) {
  try {
    const user = await db.getById("users", userId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Return the user without sensitive information
    const { password_hash, ...userWithoutPassword } = user as any

    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Get current user error:", error)
    return { success: false, error: "An error occurred while fetching the user" }
  }
}

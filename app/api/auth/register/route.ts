import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import z from "zod";
import { prisma } from "@/lib/db/prisma";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: { message: "Validation error", details: validationResult.error.flatten() } },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_EXISTS", message: "User with this email already exists" } },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER" // Default role
      }
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "An error occurred during registration" } },
      { status: 500 }
    );
  }
}
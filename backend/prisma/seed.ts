import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding local database...");

  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 10);

  const john = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      passwordHash,
      color: "#0058be",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjOmV6lF-hK3n28hNaH3OrhKu2mekMOKHjobSR4VsFfz5znOI_MwXsl3Ks_eXq-TNDEnxHXWGvfTP96WQs7oOpR3syQFA75yHxZb4Eu03TT3yhDbVXFOlEXb8YmrxumKMIJkGBczZoKmXeKfEIepITWkCb919YCqISdijdNfWnAHSWVAJ7BeM4hiNBJlbmW48fiymC7BfjJjGvsuxLuTPoVTiW5KtLxX7ngYeMBjJT-l0sdvgxo5Gi8g",
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex",
      email: "alex@example.com",
      passwordHash,
      color: "#0058be",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMVJ1B_3NyyDolRl7xNKeVFd-IpxnQIRkVVpr1TuH8JrvheG7lb_P3REtXKz4UtTbcUQFvRz7ew0SB2ANxFjL_-lFqjyUj1InwzOeQPIyEV6y1SNWGctMayickP77eLb46uvdk1dAmpGwiW9FFny21pJWunAX2go6u8DVbLowGPnqZTJOYz7H7cDHGdi4jc7dDZW9SvnxXGLai6DHUCVzAuzhHQhNRlI56A56HjQwm0NeLusD7wxa2NA",
    },
  });

  const rahul = await prisma.user.upsert({
    where: { email: "rahul@example.com" },
    update: {},
    create: {
      name: "Rahul",
      email: "rahul@example.com",
      passwordHash,
      color: "#b75b00",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmjRgggA6qCCLsSN8Auq7JUZg25emChGqvBT-D0jhGClPXMMAUd-Byv-5lXHm6Phhj-LBPxpzNr_MalS24V5hOh29ugDKX-QUtxv9XdWC5q_ecfRKLX41QSwxm4n9Uw7uKhG-bnjP2TeJ7rRYI6bQAaFikwteHoz0HAgIdgUsFTCWH0hLAHkPdVOylxrtnlqQiW8g5LExpAEzAwb_w8GC5oC-UdnIK-p-IT3GdQXdTFRz1tfdLMItusA",
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Smith",
      email: "alice@example.com",
      passwordHash,
      color: "#4648d4",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkCacw5zYKLRyoaw7hMGilc_qFD4mQlS3OKR5E3N6IyaWmHTEffS0HJikjaATReSA0X8vgDHIA6ATIy-XwUksyssBNVW9Eyub_jKX02XwWRKEy3PCrIE23-GEq1KxOk3CLVd0sNjUHqAeStDniJHo5R7g4VKT9UuSOZydNG7nLvXR6ZFqon2ytNY2vRNz8zi_pLlV1VbQveC2uXa_lrXKj7TbSB5HSTfDtqF__jBMQ52_owiGN2t65yg",
    },
  });

  // Create sample boards
  const board1 = await prisma.board.upsert({
    where: { id: "board-1" },
    update: {},
    create: {
      id: "board-1",
      name: "Q3 Product Roadmap & Strategy",
      description: "Quarterly alignment and architecture brainstorm session",
      category: "ACTIVE",
      ownerId: john.id,
      members: {
        create: [
          { userId: john.id, role: "OWNER" },
          { userId: alex.id, role: "EDITOR" },
          { userId: rahul.id, role: "EDITOR" },
          { userId: alice.id, role: "VIEWER" },
        ],
      },
    },
  });

  const board2 = await prisma.board.upsert({
    where: { id: "board-2" },
    update: {},
    create: {
      id: "board-2",
      name: "Design System Core Components V2",
      description: "Design tokens, buttons, toolbars and modals specifications",
      category: "DESIGN",
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: john.id, role: "EDITOR" },
          { userId: alex.id, role: "EDITOR" },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
  console.log("Users created:", { john: john.email, alex: alex.email, rahul: rahul.email, alice: alice.email });
  console.log("Default password for all users: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

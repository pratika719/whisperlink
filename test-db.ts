import { prisma } from "./src/lib/prisma/prisma";

async function main() {
  try {
    // 1. Create a test user
    const user = await prisma.user.create({
      data: {
        username: "testuser_" + Date.now(),
        email: "test_" + Date.now() + "@example.com",
        password: "hashedpassword",
        acceptMessages: true,
      },
    });
    console.log("Created user:", user.username);

    // 2. Toggle messages
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { acceptMessages: false },
    });
    console.log("Toggled messages:", updatedUser.acceptMessages);

    // 3. Create a message
    const msg = await prisma.message.create({
      data: {
        receiverId: user.id,
        content: "Test message",
      },
    });
    console.log("Created message:", msg.id);

    // 4. Fetch inbox
    const inbox = await prisma.message.findMany({
      where: { receiverId: user.id, isDeleted: false },
    });
    console.log("Inbox count:", inbox.length);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
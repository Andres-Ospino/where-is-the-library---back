import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create sample books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        available: true,
      },
    }),
    prisma.book.create({
      data: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        available: true,
      },
    }),
    prisma.book.create({
      data: {
        title: "1984",
        author: "George Orwell",
        available: true,
      },
    }),
    prisma.book.create({
      data: {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        available: true,
      },
    }),
    prisma.book.create({
      data: {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        available: false, // This one will be on loan
      },
    }),
  ])

  console.log(`Created ${books.length} books`)

  // Create sample members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    }),
    prisma.member.create({
      data: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
      },
    }),
    prisma.member.create({
      data: {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
      },
    }),
  ])

  console.log(`Created ${members.length} members`)

  // Create sample loans
  const loans = await Promise.all([
    prisma.loan.create({
      data: {
        bookId: books[4].id, // The Catcher in the Rye (marked as unavailable)
        memberId: members[0].id, // John Doe
        loanDate: new Date("2024-01-15"),
        // No return date - active loan
      },
    }),
    prisma.loan.create({
      data: {
        bookId: books[1].id, // To Kill a Mockingbird
        memberId: members[1].id, // Jane Smith
        loanDate: new Date("2024-01-10"),
        returnDate: new Date("2024-01-20"), // Returned loan
      },
    }),
  ])

  console.log(`Created ${loans.length} loans`)

  console.log("Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

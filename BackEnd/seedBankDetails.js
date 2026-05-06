const { BankDetail } = require('./models');

async function seed() {
  try {
    await BankDetail.sync();
    const count = await BankDetail.count();
    if (count === 0) {
      await BankDetail.create({
        bankName: "Bank of Ceylon",
        accountName: "Click Pvt Ltd",
        accountNumber: "1234 5678 9012",
        branch: "Colombo 03"
      });
      console.log("✅ Bank details seeded successfully!");
    } else {
      console.log("ℹ️ Bank details already exist, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Error seeding bank details:", error);
  }
  process.exit();
}

seed();

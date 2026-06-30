const { BankDetail } = require('./models');
require('dotenv').config();

async function seed() {
  try {
    await BankDetail.sync();
    const count = await BankDetail.count();
    if (count === 0) {
      const required = ['BANK_NAME', 'BANK_ACCOUNT_NAME', 'BANK_ACCOUNT_NUMBER', 'BANK_BRANCH'];
      const missing = required.filter((key) => !process.env[key]);
      if (missing.length > 0) {
        throw new Error(`Missing bank seed env values: ${missing.join(', ')}`);
      }

      await BankDetail.create({
        bankName: process.env.BANK_NAME,
        accountName: process.env.BANK_ACCOUNT_NAME,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        branch: process.env.BANK_BRANCH
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

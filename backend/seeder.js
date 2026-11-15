const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { randomBytes } = require('crypto');

dotenv.config();

const User = require('./models/User');
const Donor = require('./models/Donor');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || 'donorx',
    });
    console.log('Connected to MongoDB...');

    if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD to provision an administrator');
      }
      if (process.env.ADMIN_PASSWORD.length < 16) {
        throw new Error('ADMIN_PASSWORD must be at least 16 characters');
      }

      const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
      const admin = await User.findOne({ email });
      if (admin) {
        if (email === 'admin@raktasetu.in' && await admin.matchPassword('admin123')) {
          admin.password = process.env.ADMIN_PASSWORD;
        }
        if (admin.role !== 'admin') {
          admin.role = 'admin';
        }
        await admin.save();
        console.log('Administrator account is ready; existing non-legacy passwords are preserved.');
      } else {
        await User.create({
          name: 'RaktaSetu Administrator',
          email,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log('Administrator account provisioned.');
      }
    } else {
      console.log('No administrator provisioned. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
    }
    const legacyAdmin = await User.findOne({ email: 'admin@raktasetu.in', role: 'admin' });
    if (legacyAdmin && process.env.ADMIN_EMAIL?.trim().toLowerCase() !== legacyAdmin.email) {
      legacyAdmin.role = 'seeker';
      legacyAdmin.password = randomBytes(32).toString('hex');
      await legacyAdmin.save();
      console.log('Disabled the legacy public administrator credentials.');
    }

    const sampleDonorPhones = [
      '9876543210', '9876543211', '9876543212', '9876543213',
      '9876543214', '9876543215', '9876543216', '9876543217',
    ];
    const sampleDonors = await Donor.find({ phone: { $in: sampleDonorPhones } }).select('user');
    const sampleUserIds = sampleDonors.map((donor) => donor.user).filter(Boolean);
    if (sampleUserIds.length) {
      await User.updateMany({ _id: { $in: sampleUserIds } }, { $set: { isActive: false } });
      await Donor.updateMany(
        { phone: { $in: sampleDonorPhones } },
        { $set: { isAvailable: false, availabilityStatus: 'Resting' } }
      );
      console.log('Disabled built-in sample donor profiles; real donor accounts are preserved.');
    }

    console.log('Database setup completed successfully.');
  } catch (err) {
    throw new Error(`Seed error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

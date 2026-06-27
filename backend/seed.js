const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

dotenv.config();

const departmentsData = [
  {
    departmentName: 'Road Department',
    officerName: 'Mr. Rajesh Kumar',
    contactInfo: '+91-11-2345-6789, email: roads@civicconnect.gov'
  },
  {
    departmentName: 'Water Department',
    officerName: 'Mrs. Sunita Sharma',
    contactInfo: '+91-11-2345-6788, email: water@civicconnect.gov'
  },
  {
    departmentName: 'Electricity Department',
    officerName: 'Mr. Anil Gupta',
    contactInfo: '+91-11-2345-6787, email: electricity@civicconnect.gov'
  },
  {
    departmentName: 'Sanitation Department',
    officerName: 'Mr. Ramesh Singh',
    contactInfo: '+91-11-2345-6786, email: sanitation@civicconnect.gov'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_issue_tracker';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Clear existing data
    console.log('Clearing database...');
    await User.deleteMany();
    await Department.deleteMany();
    await Complaint.deleteMany();
    await Notification.deleteMany();
    console.log('Database cleared.');

    // Seed Departments
    console.log('Seeding departments...');
    const createdDepts = await Department.create(departmentsData);
    console.log(`${createdDepts.length} departments seeded.`);

    // Map department names to their IDs for complaints assignment
    const deptMap = {};
    createdDepts.forEach(d => {
      deptMap[d.departmentName] = d._id;
    });

    // Seed Users
    console.log('Seeding users...');
    
    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin Officer',
      email: 'admin@civicconnect.gov',
      phone: '9876543210',
      password: 'adminpassword', // will be hashed by mongoose pre-save hook
      role: 'admin',
      address: 'Municipal HQ, Block A, Civic Center'
    });

    // Create Citizen User
    const citizenUser = await User.create({
      name: 'Aarav Mehta',
      email: 'citizen@gmail.com',
      phone: '9876543211',
      password: 'citizenpassword', // will be hashed by mongoose pre-save hook
      role: 'citizen',
      address: 'Flat 402, Sunshine Apts, Sector 5'
    });

    console.log('Users seeded successfully.');
    console.log(`- Admin Credentials: Email: admin@civicconnect.gov | Password: adminpassword`);
    console.log(`- Citizen Credentials: Email: citizen@gmail.com | Password: citizenpassword`);

    // Seed Complaints (using Delhi coordinates for realism)
    console.log('Seeding complaints...');
    
    const complaintsData = [
      {
        title: 'Deep Pothole-ridden Stretch near Flyover',
        category: 'Damaged Roads',
        description: 'The main crossing under the flyover has developed three large potholes that are about 6-8 inches deep. They cause major traffic delays during peak hours and pose a severe hazard to two-wheelers, especially after dark.',
        image: '',
        location: 'Sector 5 Crossing, Under Flyover, New Delhi, Delhi 110001',
        latitude: 28.5355,
        longitude: 77.2090,
        status: 'Pending',
        assignedDepartment: null,
        userId: citizenUser._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        title: 'Water Leakage from Broken Supply Pipe',
        category: 'Water Leakage',
        description: 'The primary water pipe line has cracked near the corner of Block B market. Thousands of liters of clean drinking water are being wasted and the street has completely flooded, making it difficult for shoppers and pedestrians.',
        image: '',
        location: 'Block B Market Main Road, New Delhi, Delhi 110012',
        latitude: 28.5411,
        longitude: 77.2012,
        status: 'Resolved',
        assignedDepartment: deptMap['Water Department'],
        userId: citizenUser._id,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        title: 'Broken Streetlight near Children Park',
        category: 'Broken Streetlights',
        description: 'Streetlight pole SL-442 has been inactive for the past 4 days. The children park entry area remains completely pitch black in the evening, raising security concerns for families and children visiting the area.',
        image: '',
        location: 'Lane 3, children Park Entrance, New Delhi, Delhi 110018',
        latitude: 28.5244,
        longitude: 77.2188,
        status: 'In Progress',
        assignedDepartment: deptMap['Electricity Department'],
        userId: citizenUser._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        title: 'Overflowing Municipal Garbage Bin',
        category: 'Garbage Issues',
        description: 'The community dumpster has not been cleared for over a week. Trash is spilling out onto the sidewalk, creating an unsanitary environment and emitting a foul smell. Stray animals are scattering the waste further.',
        location: 'Outer Ring Road, Near Gate 1 Apartments, New Delhi, Delhi 110020',
        latitude: 28.5305,
        longitude: 77.2055,
        status: 'Under Review',
        assignedDepartment: deptMap['Sanitation Department'],
        userId: citizenUser._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    const seededComplaints = await Complaint.create(complaintsData);
    console.log(`${seededComplaints.length} complaints seeded.`);

    // Seed mock Notifications
    console.log('Seeding notifications...');
    await Notification.create([
      {
        userId: citizenUser._id,
        message: 'Your complaint "Water Leakage from Broken Supply Pipe" has been resolved by the Water Department.',
        status: 'read',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        userId: citizenUser._id,
        message: 'Your complaint "Broken Streetlight near Children Park" has been assigned to the Electricity Department.',
        status: 'unread',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 65 * 1000)
      }
    ]);
    console.log('Notifications seeded.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();

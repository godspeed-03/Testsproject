// const mongoose = require('mongoose');
// const fs = require('fs');

// const testSchema = new mongoose.Schema({
//   testId: { type: String, required: true, unique: true },
//   testName: { type: String, required: true },
//   testJSON: { type: Object, required: true },
//   createdBy: { type: String, required: true },
//   totalQuestions: { type: Number, default: 0 },
//   totalTime: { type: Number, default: 0 },
//   settings: {
//     isLive: { type: Boolean, default: true },
//     strictSectionOrder: { type: Boolean, default: false },
//     goLiveDate: { type: Date, default: null },
//     allowPracticeMode: { type: Boolean, default: true },
//     allowTestMode: { type: Boolean, default: true },
//     timingMode: { type: String, default: 'full' }
//   }
// }, { timestamps: true });

// const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

// async function pushTests() {
//   try {
//     if (!process.env.MONGODB_URI) {
//       throw new Error('MONGODB_URI is not defined in .env.development');
//     }

//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('Connected to MongoDB');

//     // First delete all existing tests
//     await Test.deleteMany({});
//     console.log('Successfully deleted all existing tests from the database.');

//     const testsRaw = fs.readFileSync('./test.json', 'utf8');
//     const testsArray = JSON.parse(testsRaw);
    
//     // The specific user ID the user requested
//     const ADMIN_USER_ID = "6a1861b1bc8024a3c77f0cd1";

//     for (const testData of testsArray) {
//       let totalQuestions = 0;
//       testData.sections.forEach(section => {
//         if (section.questions) {
//           totalQuestions += section.questions.length;
//         }
//       });

//       const doc = {
//         testId: testData.testId,
//         testName: testData.testName,
//         testJSON: testData,
//         createdBy: ADMIN_USER_ID,
//         totalQuestions,
//         totalTime: testData.totalTime || 0,
//         settings: {
//           isLive: true,
//           strictSectionOrder: false,
//           goLiveDate: new Date(),
//           allowPracticeMode: true,
//           allowTestMode: true,
//           timingMode: 'full'
//         }
//       };

//       // Since we deleted everything, we can just use create
//       await Test.create(doc);
//       console.log(`Successfully pushed new test: ${doc.testId}`);
//     }

//     console.log('All tests have been successfully created with the new createdBy ID.');
//     process.exit(0);
//   } catch (error) {
//     console.error('Error pushing tests:', error);
//     process.exit(1);
//   }
// }

// pushTests();

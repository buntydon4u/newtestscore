## Fix Verification

The issue has been fixed in the `enrollInSchedule` method in `/src/services/exam.service.ts`. 

### Changes Made:
1. Added a check for existing enrollments before attempting to create a new one
2. If an existing enrollment is found with status 'CANCELLED', the system now updates it back to 'ENROLLED' instead of throwing an error
3. Added validation to prevent enrollment in past exams
4. The enrolledCount is properly incremented when re-enrolling

### How It Works:
- When a student tries to enroll:
  - First checks if the exam date is still valid (not in the past)
  - Then checks for existing enrollment
  - If no enrollment exists, creates a new one
  - If enrollment exists with status 'ENROLLED', throws "Already enrolled" error
  - If enrollment exists with status 'CANCELLED', updates it back to 'ENROLLED'

### Test the Fix:
You can test this by:
1. Enrolling in an exam schedule
2. Canceling the enrollment (using DELETE endpoint)
3. Trying to enroll again - it should now succeed if the exam date is still valid

The fix ensures students can re-enroll after cancellation as long as the exam hasn't started yet.

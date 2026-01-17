# Test User & Real Data Guide

PlateCheck now supports both test users with mock data and real users with database-backed data.

## Test User

**Email:** `test@platecheck.app` (or any email ending with `@test.platecheck.app`)

### How to Use

1. Sign up with the test email: `test@platecheck.app`
2. Use any password (min 8 characters, 1 uppercase, 1 number)
3. The app will automatically detect this is a test user
4. You'll see 100% mock data:
   - Pre-populated meal logs
   - Sample nutrition plan with 4 meal templates
   - Weekly progress data
   - Daily adherence scores

### Mock Data Included

- **Meals:** 3 logged meals (breakfast, lunch, snack)
- **Nutrition Plan:** "Weight Management Plan" with templates for breakfast, lunch, dinner, snacks
- **Progress:** 7 days of mock weekly data
- **Scores:** Sample adherence scores and streaks

## Real User (Your Account)

**Any other email:** Your personal account with real database data

### How to Use

1. Sign up with your own email (not the test email)
2. Create a password and confirm your email
3. Your data will be stored in Supabase
4. Start with an empty state:
   - No meal logs (start logging!)
   - No nutrition plan (import one!)
   - No progress data (build your streak!)

### What's Connected to Database

✅ **Implemented:**
- Meal logs (`meal_logs` table)
- Nutrition plans (`nutrition_plans` table)
- Meal templates (`meal_templates` table)
- Daily progress (`daily_progress` table)
- Weekly aggregations

🚧 **Coming Soon:**
- Meal photo upload
- Plan PDF parsing
- AI meal analysis
- Photo-based food detection

## Implementation Details

### How It Works

The app uses conditional data fetching:

```typescript
// Check if user is test user
if (isTestUser(user?.email)) {
  return mockData;
}

// Otherwise fetch from Supabase
const { data, error } = await supabase
  .from("meal_logs")
  .select("*")
  .eq("user_id", user.id);
```

### Key Files

- **`src/lib/test-data.ts`** - All mock data definitions
- **`src/hooks/use-meals.ts`** - Meal data fetching
- **`src/hooks/use-nutrition-plan.ts`** - Plan data fetching
- **`src/hooks/use-progress.ts`** - Progress/stats fetching

### Pages Updated

1. **Home** - Shows real meals and daily stats
2. **Plan** - Displays real nutrition plan or empty state
3. **Progress** - Real daily/weekly progress data
4. **Settings** - Real user profile info

## Database Schema

Real user data is stored in these tables:

```
- user_profiles (user info)
- nutrition_plans (uploaded plans)
- meal_templates (plan meal definitions)
- meal_logs (logged meals with AI analysis)
- daily_progress (daily adherence scores)
- weekly_progress (weekly aggregations)
```

## Next Steps for Real Users

1. **Import a nutrition plan** (currently shows upload UI, parsing coming soon)
2. **Log meals manually** (photo capture & AI analysis coming soon)
3. **View progress** (will populate as you log meals)

## Switching Between Test and Real

You can have both accounts:

1. **Test account:** Sign up with `test@platecheck.app`
2. **Real account:** Sign up with your personal email
3. Switch by logging out and logging in with different email

The app automatically detects which mode to use based on the email.

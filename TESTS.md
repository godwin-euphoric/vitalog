# VitaLog — Manual Test Checklist

Test each item below. Mark ✅ pass or ❌ fail with notes.

---

## 1. AUTH

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1.1 | Open app fresh (not logged in) | Sign In screen appears | |
| 1.2 | Tap "Don't have an account? Sign up" | Switches to Sign Up screen | |
| 1.3 | Sign up with empty fields | Error: "Please enter your email and password" | |
| 1.4 | Sign up with password < 6 chars | Error: "Password must be at least 6 characters" | |
| 1.5 | Sign up with valid email + password | Account created → redirected to Sign In → toast "Account created! Please sign in." | |
| 1.6 | Sign in with wrong password | Error: "Incorrect email or password" | |
| 1.7 | Sign in with correct credentials | App opens (onboarding if new, home if returning) | |
| 1.8 | Close and reopen app (same device) | Goes straight to home — no sign in needed | |
| 1.9 | Sign out from Settings | Confirmation dialog appears | |
| 1.10 | Confirm sign out | App reloads, Sign In screen appears | |

---

## 2. ONBOARDING

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 2.1 | Choose "Calculate for me" | Starts 6-step form (gender → age → weight → height → activity → goal) | |
| 2.2 | Enter invalid age (e.g. 5) | Error shown, cannot proceed | |
| 2.3 | Enter invalid weight (e.g. 5) | Error shown, cannot proceed | |
| 2.4 | Enter invalid height (e.g. 50) | Error shown, cannot proceed | |
| 2.5 | Complete all 6 steps | Reaches API key screen | |
| 2.6 | Try to finish with empty API key | Error: "Please enter your Gemini API key" | |
| 2.7 | Enter valid API key → Finish Setup | Done screen shows calculated calorie target | |
| 2.8 | Tap "Start Tracking" | Home screen appears | |
| 2.9 | Choose "I'll set it manually" | Single calorie input screen | |
| 2.10 | Enter invalid calories (e.g. 100) | Error shown | |
| 2.11 | Back buttons work on each step | Goes to correct previous step | |

---

## 3. FOOD LOGGING

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 3.1 | Type food and tap send | Spinner shows "Analyzing nutrition..." | |
| 3.2 | Valid food (e.g. "2 boiled eggs") | Food card appears with name, calories, macros | |
| 3.3 | Log multiple foods | All appear as cards in order | |
| 3.4 | Delete a food card | Card removed, dashboard updates | |
| 3.5 | Press Enter in food input | Same as tapping send | |
| 3.6 | Tap mic button | Mic activates (listening state) | |
| 3.7 | Speak food name | Input fills with spoken text | |
| 3.8 | Log food with no API key | Error toast shown | |

---

## 4. WORKOUT LOGGING

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 4.1 | Type workout and tap send | Spinner shows "Estimating calories burnt..." | |
| 4.2 | Valid workout (e.g. "30 min running") | Workout card appears with exercise, duration, calories burnt | |
| 4.3 | Log multiple workouts | All appear as cards | |
| 4.4 | Delete a workout | Card removed, dashboard updates | |
| 4.5 | Mic input for workout | Works same as food mic | |

---

## 5. DAILY DASHBOARD (Home screen)

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 5.1 | Open app with no food logged | Ring shows 0, all macros show 0g | |
| 5.2 | Log food | Ring fills proportionally, macros update | |
| 5.3 | Ring color at 0–74% | Green (#c8f135) | |
| 5.4 | Ring color at 75–99% | Orange | |
| 5.5 | Ring color at 100%+ | Red | |
| 5.6 | Warning banner at 75% | Orange banner appears with percentage | |
| 5.7 | Warning banner at 100% | Red banner with "You've hit your target!" | |
| 5.8 | Net calories = consumed − burnt | Correct math shown in net card | |

---

## 6. FEATURE 3 — CALORIE WARNING BACKGROUND

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 6.1 | Food intake below 75% | Home background is normal dark (#080808) | |
| 6.2 | Food intake reaches 75% | Home background shifts to subtle dark red tint | |
| 6.3 | Food intake reaches 100% | Background becomes deeper red | |
| 6.4 | Delete food to go below 75% | Background returns to normal | |
| 6.5 | Vibration at 75% (mobile) | Single vibration felt | |
| 6.6 | Vibration at 100% (mobile) | Triple vibration felt | |

---

## 7. WEEKLY DASHBOARD

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 7.1 | Tap Dashboard → Weekly tab | Bar chart renders for last 7 days | |
| 7.2 | Today's bar reflects logged calories | Bar height matches consumption | |
| 7.3 | Bars over target are red | Red color for days exceeding target | |
| 7.4 | 7-day deficit/surplus shown | Correct total calculation | |
| 7.5 | Macro split shows today's breakdown | Protein / Carbs / Fat % shown | |

---

## 8. MONTHLY DASHBOARD

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 8.1 | Tap Monthly tab | Bar chart renders for current month | |
| 8.2 | Stats cards show avg, deficit, best/worst day | Data populated | |
| 8.3 | Streak shows correct logged days in a row | Correct count | |

---

## 9. YEARLY DASHBOARD

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 9.1 | Tap Yearly tab | Bar chart renders 12 months | |
| 9.2 | Stats show total cals, avg, best/worst month | Data populated | |

---

## 10. FEATURE 2 — EXPORT SUMMARY

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 10.1 | Tap "Export Summary as Image" on Weekly tab | Downloads PNG or opens share sheet | |
| 10.2 | Exported image has correct data | VitaLog branding, correct stats, correct date range | |
| 10.3 | Switch to Monthly → export | Monthly data in image | |
| 10.4 | Switch to Yearly → export | Yearly data in image | |
| 10.5 | Share on Android (mobile) | Share sheet opens with WhatsApp option | |

---

## 11. FEATURE 1 — QUICK WORKOUT WHEEL

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 11.1 | Tap ⚡ FAB button | Wheel modal slides up | |
| 11.2 | Tap "Spin the Wheel!" | Wheel spins with animation and lands on a segment | |
| 11.3 | After spin — result shown | Exercise name, instructions, YouTube link visible | |
| 11.4 | Tap "Watch on YouTube" | Opens YouTube search in new tab | |
| 11.5 | Tap "Spin Again" | Returns to wheel, can spin again | |
| 11.6 | Tap "Start 5-min Timer" | Countdown starts from 5:00 | |
| 11.7 | Timer counts down correctly | Each second decrements | |
| 11.8 | Timer reaches 0:00 | "Great work! Workout logged" shown | |
| 11.9 | Workout auto-logged | Workout card appears in home screen log | |
| 11.10 | Tap "Skip Workout" | Modal closes, nothing logged | |
| 11.11 | Tap ✕ close button | Modal closes, timer cancelled | |
| 11.12 | Vibration at each minute mark (mobile) | Vibration felt at 4:00, 3:00, 2:00, 1:00 | |
| 11.13 | Vibration when timer ends (mobile) | Triple vibration felt | |

---

## 12. AI CHAT

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 12.1 | Tap Chat tab | Chat screen with welcome message | |
| 12.2 | Ask a nutrition question | AI responds within seconds | |
| 12.3 | Typing indicator shows while waiting | Three dots animate | |
| 12.4 | Mic input in chat | Voice transcribed into input | |
| 12.5 | Press Enter to send | Same as tapping send button | |

---

## 13. SETTINGS

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 13.1 | Tap Settings tab | Shows current calorie target | |
| 13.2 | Update calorie target | New target reflected in dashboard ring | |
| 13.3 | Enter invalid calorie target | Toast error shown | |
| 13.4 | Update API key | Toast "API key updated" | |
| 13.5 | Tap "Reset Today's Log" | Confirmation dialog appears | |
| 13.6 | Confirm reset today | Food and workout logs cleared | |
| 13.7 | Tap "Reset All Data" | Confirmation dialog appears | |
| 13.8 | Confirm reset all | App reloads, onboarding shown | |
| 13.9 | Sign Out → confirm | Redirected to Sign In screen | |

---

## 14. FIREBASE CLOUD SYNC

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 14.1 | Log food on Device A | Food appears in log | |
| 14.2 | Sign in on Device B with same account | Same food log loads from Firestore | |
| 14.3 | Log workout on Device B | Workout saved to cloud | |
| 14.4 | Sign back in on Device A | Workout from Device B appears | |
| 14.5 | Sign out and sign back in | All data restored from cloud | |

---

## 15. EDGE CASES

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15.1 | Log food with no internet | Toast: "No internet connection" | |
| 15.2 | Open app at midnight | Previous day archived, new day starts fresh | |
| 15.3 | Very long food name | Displays cleanly without breaking layout | |
| 15.4 | Tap send with empty food input | Nothing happens | |
| 15.5 | Multiple rapid taps on send | Only one request sent (button disabled) | |

---

**Total: 75 test cases**

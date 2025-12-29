AI-Dermatologist Project Pseudocode

Algorithm 1: User Registration and Authentication

function handleRoleSelection();
1.  Input: User interaction with Firstscreen component
2.  Output: Selected role (patient/doctor) or null
3.  Display role selection options:
    - "I'm a user looking for a doctor" (patient role)
    - "I'm a doctor looking for a patient" (doctor role)
4.  if user selects role then
5.      set selectedRole = user selection
6.  else
7.      set selectedRole = null
8.  end
9.  if selectedRole is null then
10.     display error: "Please select a role to continue"
11.     return null
12. end
13. return selectedRole
14. end function

function handleSignup(name, email, password, role);
15.  Input: name (string), email (string), password (string), role (string)
16.  Output: Success status or error message
17.  if name is empty OR email is empty OR password is empty then
18.     display error: "All fields are required"
19.     return false
20. end
21.  if password does not match pattern (8+ chars, uppercase, digit, special) then
22.     display error: "Password must be at least 8 characters with uppercase, number, and special character"
23.     return false
24. end
25.  check if email exists in users table
26.  if email exists then
27.     display error: "This email is already registered"
28.     return false
29. end
30.  call supabase.auth.signUp(email, password)
31.  if signUp fails then
32.     display error: authError.message
33.     return false
34. end
35.  set userId = authData.user.id
36.  insert into users table (id, name, email, role)
37.  display success modal: "We've sent a confirmation link to {email}"
38.  redirect to Login Screen
39.  return true
40. end function

function handleLogin(email, password);
41.  Input: email (string), password (string)
42.  Output: Authentication result and redirect path
43.  call supabase.auth.signInWithPassword(email, password)
44.  if authentication fails then
45.     display error: "Invalid email or password"
46.     return false
47. end
48.  set loginTimestamp = current timestamp
49.  store loginTimestamp in localStorage
50.  fetch user role from users table where email = email
51.  if user role is 'admin' then
52.     redirect to '/NewRequest'
53.  else
54.     redirect to '/'
55. end
56.  return true
57. end function

function handlePasswordReset(email);
58.  Input: email (string)
59.  Output: Reset email sent status
60.  if email is empty then
61.     display error: "Please enter your email address"
62.     return false
63. end
64.  call supabase.auth.resetPasswordForEmail(email, redirectTo: '/ResetPassword')
65.  if reset email fails then
66.     display error: error.message
67.     return false
68. end
69.  display message: "Password reset email sent! Please check your inbox"
70.  return true
71. end function

function handleResetPassword(newPassword, confirmPassword);
72.  Input: newPassword (string), confirmPassword (string)
73.  Output: Password reset success status
74.  if newPassword ≠ confirmPassword then
75.     display error: "Passwords do not match"
76.     return false
77. end
78.  if password does not meet requirements then
79.     display error: "Password must meet requirements"
80.     return false
81. end
82.  call supabase.auth.updateUser({ password: newPassword })
83.  display success message
84.  redirect to Login Screen
85.  return true
86. end function

// ============================================================

Algorithm 2: Doctor Profile Creation

function checkProfileStatus(doctorId);
1.   Input: doctorId (string)
2.   Output: Profile status (Pending/Approved/Rejected/null)
3.   fetch profile from ProfileforApproval table where id = doctorId
4.   if profile exists then
5.      return profile.approvalStatus
6.   else
7.      return null
8.   end
9. end function

function handleProfileSubmission(formData, uploadFiles, doctorId);
10.  Input: formData (object), uploadFiles (object), doctorId (string)
11.  Output: Submission success status
12.  validate formData fields (name, gender, experience, email, phone, cnic, specialization, location)
13.  if validation fails then
14.     display error: "{field} is required"
15.     return false
16. end
17.  validate uploadFiles (pmcCertificate, houseJobCertificate, cnicFront, cnicBack)
18.  if any required file is missing then
19.     display error: "This document is required"
20.     return false
21. end
22.  upload files to storage and get URLs
23.  save profile to ProfileforApproval table:
    - id = doctorId
    - approvalStatus = 'Pending'
    - all formData fields
    - file URLs
24.  display success message: "Profile submitted successfully!"
25.  redirect to Home Page
26.  return true
27. end function

function handleProfileSettings(doctorId, settingsData);
28.  Input: doctorId (string), settingsData (object: fees, about, experience, faqs)
29.  Output: Settings save success status
30.  validate consultation fee
31.  if fee is empty OR fee ≤ 0 then
32.     display error: "Consultation fee is required"
33.     return false
34. end
35.  validate about section
36.  if about length < 20 characters then
37.     display error: "About section must be at least 20 characters"
38.     return false
39. end
40.  update ProfileSettings table where doctor_id = doctorId
41.  display success message: "Settings saved successfully"
42.  return true
43. end function

// ============================================================

Algorithm 3: Skin Disease Detection

function handleImageUpload(file);
1.   Input: file (File object)
2.   Output: Image preview URL or error
3.   if file is null then
4.      display error: "Please select an image first"
5.      return null
6.   end
7.   validate file type (image/*)
8.   validate file size (max 10MB)
9.   if validation fails then
10.     display error: "Invalid file format or size"
11.     return null
12. end
13.  set preview = URL.createObjectURL(file)
14.  display preview image
15.  return preview
16. end function

function handlePredictResult(imageFile);
17.  Input: imageFile (File object)
18.  Output: Prediction result (disease, confidence) or error
19.  if imageFile is null then
20.     display error: "Please select an image first"
21.     return null
22. end
23.  create FormData
24.  append imageFile to FormData as "image"
25.  set loading = true
26.  call POST request to 'http://localhost:5000/predict' with FormData
27.  if response contains error then
28.     display error: response.error
29.     set loading = false
30.     return null
31. end
32.  set result = response.data (class_name, confidence)
33.  display result:
    - Disease: result.class_name
    - Confidence: (result.confidence × 100)%
34.  if confidence > 0.8 then
35.     display confidence in green
36.  else if confidence > 0.6 then
37.     display confidence in orange
38.  else
39.     display confidence in red
40. end
41.  set loading = false
42.  return result
43. end function

function sendChatBotMessage(message, disease, confidence);
44.  Input: message (string), disease (string), confidence (number)
45.  Output: AI response (string)
46.  if message is empty then
47.     return null
48. end
49.  create messageWithContext:
    - if disease exists then append disease and confidence to message
    - else use original message
50.  call POST request to 'http://localhost:5000/chat-bot' with {message, disease, confidence}
51.  if request fails then
52.     display error: "Error connecting to AI service"
53.     return null
54. end
55.  return response.reply
56. end function

// ============================================================

Algorithm 4: Dermatologist Listing

function fetchDoctors();
1.   Input: None
2.   Output: List of approved doctors
3.   fetch doctors from API where approvalStatus = 'Approved' AND approvalStatus ≠ 'De-activated'
4.   join with ProfileSettings table for fees
5.   join with Reviews table for review count
6.   return doctors array
7. end function

function filterDoctors(doctors, filterType);
8.   Input: doctors (array), filterType (string: "all"/"female"/"male"/"lowestFees")
9.   Output: Filtered doctors array
10.  if filterType = "all" then
11.     return doctors
12.  else if filterType = "female" then
13.     return filter doctors where gender = "female"
14.  else if filterType = "male" then
15.     return filter doctors where gender = "male"
16.  else if filterType = "lowestFees" then
17.     return sort doctors by fees ascending
18. end
19. end function

function paginateDoctors(doctors, currentPage, itemsPerPage);
20.  Input: doctors (array), currentPage (number), itemsPerPage (number)
21.  Output: Paginated doctors array
22.  set lastIndex = currentPage × itemsPerPage
23.  set firstIndex = lastIndex - itemsPerPage
24.  return doctors.slice(firstIndex, lastIndex)
25. end function

// ============================================================

Algorithm 5: Doctor Profile Display

function fetchDoctorProfile(doctorId);
1.   Input: doctorId (string)
2.   Output: Doctor profile object
3.   call GET request to 'http://localhost:5000/api/Profile/{doctorId}'
4.   return { approval: profileData, setting: settingsData }
5. end function

function displayProfileData(approval, setting);
6.   Input: approval (object), setting (object)
7.   Output: Displayed profile information
8.   display header:
    - profile picture: approval.photoUrl
    - name: approval.name + "(PMDC verified)"
    - specialization: approval.specialization
    - location: approval.location
    - phone: approval.phone
9.   display about section: setting.about
10.  display experience section:
    - for each experience in setting.experience do
    -     display hospital, role, start date, end date
    - end for
11.  display reviews section:
    - fetch reviews for doctorId
    - display review count
    - display individual reviews
12.  display FAQ section:
    - for each FAQ in setting.faqs do
    -     display question
    -     if FAQ is expanded then
    -         display answer
    -     end if
    - end for
13.  display sidebar:
    - consultation fee: setting.fees
    - "Book Appointment" button
    - "Message" button
14. end function

// ============================================================

Algorithm 6: Book Appointment

function fetchDoctorSlots(doctorId);
1.   Input: doctorId (string)
2.   Output: Available slots and booked appointments
3.   call GET request to 'http://localhost:5000/api/bookappointment/{doctorId}'
4.   return { slots: slotsArray, booked: bookedArray }
5. end function

function generateWeekDays();
6.   Input: None
7.   Output: Array of next 7 days with day names and dates
8.   set days = empty array
9.   for i = 0 to 6 do
10.     set date = current date + i days
11.     set dayName = date weekday name
12.     set formattedDate = date in ISO format
13.     append { dayName, formattedDate } to days
14. end for
15. return days
16. end function

function groupSlotsByDay(slots);
17.  Input: slots (array)
18.  Output: Slots grouped by day
19.  set grouped = { Monday: [], Tuesday: [], ..., Sunday: [] }
20.  for each slot in slots do
21.     if slot.day exists in grouped then
22.        append slot to grouped[slot.day]
23.     end if
24. end for
25. return grouped
26. end function

function isSlotAvailable(slot, bookedAppointments, dayDate);
27.  Input: slot (object), bookedAppointments (array), dayDate (string)
28.  Output: Boolean (true if available, false if booked/passed)
29.  check if slot is booked:
    - if bookedAppointments contains entry where slot_id = slot.id AND appointment_date = dayDate then
    -     return false
    - end if
30.  check if slot time has passed (for today):
    - if dayDate is today AND slot.time < current time then
    -     return false
    - end if
31.  return true
32. end function

function handleBookAppointment(selectedSlot, slotDate, doctorId, patientId);
33.  Input: selectedSlot (object), slotDate (string), doctorId (string), patientId (string)
34.  Output: Booking success status
35.  if selectedSlot is null then
36.     display error: "Please select a slot before booking"
37.     return false
38. end
39.  create payload:
    - doctorid = doctorId
    - patient_id = patientId
    - slotid = selectedSlot.id
    - AppointmentDay = selectedSlot.day
    - AppointmentTime = selectedSlot.time
    - AppointmentDate = slotDate
40.  call POST request to 'http://localhost:5000/api/sendAppointment' with payload
41.  if request fails then
42.     display error: "Failed to book appointment"
43.     return false
44. end
45.  trigger appointmentBooked event
46.  redirect to Confirmation Screen
47.  return true
48. end function

// ============================================================

Algorithm 7: Chat Module

function registerSocketConnection(userId, socket);
1.   Input: userId (string), socket (Socket object)
2.   Output: Registration status
3.   emit "register" event with userId
4.   return true
5. end function

function fetchChats(userId);
6.   Input: userId (string)
7.   Output: List of user chats
8.   call GET request to fetch user chats from API
9.   for each chat do
10.     set otherUser = (chat.user1.id = userId) ? chat.user2 : chat.user1
11.     set displayName = formatDisplayName(otherUser)
12. end for
13. return chats array
14. end function

function fetchMessages(chatId, userId, socket);
15.  Input: chatId (string), userId (string), socket (Socket object)
16.  Output: Messages array
17.  call GET request to 'http://localhost:5000/api/messages/{chatId}'
18.  set messages = response data
19.  emit "markRead" event with { chat_id: chatId, user_id: userId }
20.  update chat hasUnread = false
21.  return messages
22. end function

function sendMessage(chatId, senderId, messageText, socket);
23.  Input: chatId (string), senderId (string), messageText (string), socket (Socket object)
24.  Output: Message sent status
25.  if messageText is empty then
26.     return false
27. end
28.  emit "sendMessage" event with { chat_id: chatId, sender_id: senderId, text: messageText }
29.  add message to local messages list
30.  return true
31. end function

function handleSocketMessage(receivedMessage, selectedChatId);
32.  Input: receivedMessage (object), selectedChatId (string)
33.  Output: Updated messages list
34.  if receivedMessage.chat_id = selectedChatId then
35.     add receivedMessage to messages list
36. end if
37.  update chat list with latest message
38.  update unread count for chat
39. end function

// ============================================================

Algorithm 8: Notifications

function fetchNotifications(userId);
1.   Input: userId (string)
2.   Output: Notifications array
3.   call GET request to fetch notifications for userId
4.   sort notifications by created_at descending
5.   return notifications array
6. end function

function markNotificationAsRead(notificationId);
7.   Input: notificationId (string)
8.   Output: Update success status
9.   call PUT request to mark notification as read
10.  update local notification status to 'read'
11.  return true
12. end function

function markAllNotificationsAsRead(userId);
13.  Input: userId (string)
14.  Output: Update success status
15.  call PUT request to mark all notifications as read for userId
16.  refresh notifications list
17.  return true
18. end function

function handleNotificationClick(notification);
19.  Input: notification (object)
20.  Output: Navigation action
21.  if notification.type = 'profile_rejection' then
22.     redirect to '/ProfileDraft'
23.  else if notification.type = 'appointment' then
24.     redirect to '/UserBookings/{userId}'
25.  else if notification.type = 'message' then
26.     redirect to '/Chat/{chatId}'
27. end if
28. end function

// ============================================================

Algorithm 9: Admin Module

function authenticateAdmin(email, password);
1.   Input: email (string), password (string)
2.   Output: Authentication result
3.   call supabase.auth.signInWithPassword(email, password)
4.   if authentication fails then
5.      display error: "Invalid email or password"
6.      return false
7.   end
8.   fetch user role from users table
9.   if role ≠ 'admin' then
10.     display error: "Access denied"
11.     return false
12. end
13. redirect to '/Admin'
14. return true
15. end function

function fetchPendingRequests();
16.  Input: None
17.  Output: Pending profile requests array
18.  call GET request to 'http://localhost:5000/api/profile-for-approval'
19.  filter requests where approvalStatus = 'pending' (case-insensitive)
20. return filtered requests
21. end function

function approveRequest(requestId);
22.  Input: requestId (string)
23.  Output: Approval success status
24.  call PUT request to 'http://localhost:5000/api/update-approval-status/{requestId}'
    with body: { approvalStatus: 'Approved' }
25. if request succeeds then
26.    remove request from pending list
27.    display success message
28.    return true
29. else
30.    display error: "Failed to update status"
31.    return false
32. end
33. end function

function rejectRequest(requestId);
34.  Input: requestId (string)
35.  Output: Rejection success status
36.  call PUT request to 'http://localhost:5000/api/update-approval-status/{requestId}'
    with body: { approvalStatus: 'Rejected' }
37. if request succeeds then
38.    remove request from pending list
39.    return true
40. else
41.    display error: "Failed to update status"
42.    return false
43. end
44. end function

function fetchApprovedRequests();
45.  Input: None
46.  Output: Approved/deactivated profiles array
47.  call GET request to 'http://localhost:5000/api/profile-for-approval'
48.  filter requests where approvalStatus = 'Approved' OR approvalStatus = 'De-activated'
49. return filtered requests
50. end function

function activateProfile(requestId);
51.  Input: requestId (string)
52.  Output: Activation success status
53.  call PUT request to 'http://localhost:5000/api/update-approval-status/{requestId}'
    with body: { approvalStatus: 'Approved' }
54. if request succeeds then
55.    refresh requests list
56.    return true
57. else
58.    display error: "Failed to activate doctor profile"
59.    return false
60. end
61. end function

function deactivateProfile(requestId);
62.  Input: requestId (string)
63.  Output: Deactivation success status
64.  call PUT request to 'http://localhost:5000/api/update-approval-status/{requestId}'
    with body: { approvalStatus: 'De-activated' }
65. if request succeeds then
66.    refresh requests list
67.    return true
68. else
69.    display error: "Failed to deactivate doctor profile"
70.    return false
71. end
72. end function

function handleAdminLogout();
73.  Input: None
74.  Output: Logout status
75.  call supabase.auth.signOut()
76.  clear localStorage
77.  redirect to '/Login'
78.  return true
79. end function

// ============================================================

Algorithm 10: AI Chatbot Module

function initializeChatBot(disease, confidence);
1.   Input: disease (string), confidence (number)
2.   Output: Initialized chat bot state
3.   set messages = empty array
4.   set input = empty string
5.   store disease and confidence for context
6.   if messages.length = 0 then
7.      display message: "Start a conversation with the AI Dermatologist"
8.   end
9. end function

function sendChatBotMessage(message, disease, confidence);
10.  Input: message (string), disease (string), confidence (number)
11.  Output: AI response
12.  if message is empty then
13.     return null
14. end
15.  add user message to messages array
16.  create messageWithContext:
    - if disease exists then
    -     set messageWithContext = message + "\n\nContext: The predicted disease is \"" + disease + "\""
    -     if confidence is number then
    -         append " (confidence: " + (confidence × 100).toFixed(2) + "%)."
    -     end if
    - else
    -     set messageWithContext = message
    - end if
17.  call POST request to 'http://localhost:5000/chat-bot' with:
    - message: messageWithContext
    - disease: disease
    - confidence: confidence
18. if request fails then
19.    add error message to messages: "Error connecting to AI service"
20.    return null
21. end
22. add AI response to messages array
23. clear input field
24. return response.reply
25. end function

function handleKeyPress(event);
26.  Input: event (KeyboardEvent)
27.  Output: Message sent if Enter pressed
28.  if event.key = 'Enter' then
29.     call sendChatBotMessage()
30. end if
31. end function

END

Admin Side Functionality

START

Admin logs into AI-Dermatologist

Authenticate Admin using Supabase Auth

IF authentication fails THEN

    Display error message:

        "Invalid email or password"

    STOP

ENDIF

Redirect Admin to Admin Dashboard

// ------------------------------------------------------------

/* Phase 1: Admin Dashboard */

On Admin Dashboard Screen:

    Display welcome message:

        "Hello Admin"

        "Welcome to the Admin Dashboard"

    Display navigation sidebar with tabs:

        - New Requests

        - Approved Requests

        - GO to Home Page

        - SIGNOUT

WHEN Admin clicks "New Requests" DO

    Redirect Admin to New Requests Screen

ENDWHEN

WHEN Admin clicks "Approved Requests" DO

    Redirect Admin to Approved Requests Screen

ENDWHEN

WHEN Admin clicks "GO to Home Page" DO

    Redirect Admin to Home Page

ENDWHEN

WHEN Admin clicks "SIGNOUT" DO

    Sign out Admin from Supabase authentication

    Clear authentication session

    Redirect Admin to Login Screen

ENDWHEN

// ------------------------------------------------------------

/* Phase 2: New Requests Management */

On New Requests Screen:

    Fetch all doctor profile requests from API

    Filter requests where approvalStatus = 'pending'

    Display filtered requests in table format

    IF requests are loading THEN

        Display loading spinner

        Display message:

            "Loading requests..."

    ENDIF

    IF no pending requests found THEN

        Display empty state icon

        Display message:

            "No new requests"

        Display message:

            "There are no pending profile requests at the moment. New requests will appear here when doctors submit their profiles."

        Stay on New Requests Screen

    ENDIF

    FOR EACH request in pending requests DO

        Display request in table row:

            - Status: request.approvalStatus

            - Name: request.name

            - Details: "view" link

            - Actions: "Approve" button | "Reject" button

    ENDFOR

/* Viewing Request Details */

WHEN Admin clicks "view" link for a request DO

    Redirect Admin to Details Screen with request data

ENDWHEN

On Details Screen:

    Display loading spinner

    Display message:

        "Loading details..."

    IF data is not available THEN

        Display message:

            "No data available"

    ENDIF

    Display doctor profile information:

        - Name

        - Gender

        - Email

        - Phone

        - CNIC

        - Profile Picture (clickable image)

        - CNIC Front Image (clickable image)

        - CNIC Back Image (clickable image)

    Display "Back" button

    WHEN Admin clicks "Back" button DO

        Navigate Admin back to previous screen

    ENDWHEN

/* Approving Request */

WHEN Admin clicks "Approve" button for a request DO

    Display confirmation modal:

        Heading: "Confirm Approval"

        Message: "Are you sure you want to approve {request.name}'s profile?"

        Buttons: "NO" | "YES"

ENDWHEN

IF Admin clicks "YES" in approval modal THEN

    Send PUT request to update approvalStatus to 'Approved'

    IF request is successful THEN

        Remove request from pending requests list

        Close confirmation modal

        Display success message

    ELSE

        Display error message:

            "Failed to update status"

        Stay on New Requests Screen

    ENDIF

ENDIF

IF Admin clicks "NO" in approval modal THEN

    Close confirmation modal

    Stay on New Requests Screen

ENDIF

/* Rejecting Request */

WHEN Admin clicks "Reject" button for a request DO

    Send PUT request to update approvalStatus to 'Rejected'

    IF request is successful THEN

        Remove request from pending requests list

        Display success message

    ELSE

        Display error message:

            "Failed to update status"

        Stay on New Requests Screen

    ENDIF

ENDWHEN

// ------------------------------------------------------------

/* Phase 3: Approved Requests Management */

On Approved Requests Screen:

    Fetch all doctor profile requests from API

    Filter requests where approvalStatus = 'Approved' OR approvalStatus = 'De-activated'

    Display filtered requests in table format

    IF requests are loading THEN

        Display loading spinner

        Display message:

            "Loading requests..."

    ENDIF

    IF no approved/deactivated requests found THEN

        Display empty state icon

        Display message:

            "No approved requests"

        Display message:

            "There are no approved profile requests at the moment. Approved requests will appear here once profiles are approved."

        Stay on Approved Requests Screen

    ENDIF

    FOR EACH request in approved/deactivated requests DO

        Display request in table row:

            - Status: request.approvalStatus

            - Name: request.name

            - Details: "view" link

            - Actions: "Activate" button | "Deactivate" button

        IF request.approvalStatus = 'Approved' THEN

            Disable "Activate" button

            Enable "Deactivate" button

        ENDIF

        IF request.approvalStatus = 'De-activated' THEN

            Enable "Activate" button

            Disable "Deactivate" button

        ENDIF

    ENDFOR

/* Viewing Approved Request Details */

WHEN Admin clicks "view" link for a request DO

    Redirect Admin to Details Screen with request data

ENDWHEN

/* Activating Profile */

WHEN Admin clicks "Activate" button for a request DO

    IF request status is 'De-activated' THEN

        Send PUT request to update approvalStatus to 'Approved'

        IF request is successful THEN

            Refresh requests list

            Display success message:

                "Status updated to Approved"

        ELSE

            Display error message:

                "Failed to activate doctor profile. Please try again."

            Stay on Approved Requests Screen

        ENDIF

    ENDIF

ENDWHEN

/* Deactivating Profile */

WHEN Admin clicks "Deactivate" button for a request DO

    IF request status is 'Approved' THEN

        Send PUT request to update approvalStatus to 'De-activated'

        IF request is successful THEN

            Refresh requests list

            Display success message:

                "Status updated to De-activated"

        ELSE

            Display error message:

                "Failed to deactivate doctor profile. Please try again."

            Stay on Approved Requests Screen

        ENDIF

    ENDIF

ENDWHEN

// ------------------------------------------------------------

/* API Endpoints */

GET /api/profile-for-approval

    Returns all doctor profile requests with approvalStatus field

    Used in: New Requests Screen, Approved Requests Screen

PUT /api/update-approval-status/{id}

    Updates approval status of a doctor profile

    Body: { approvalStatus: "Approved" | "Rejected" | "De-activated" }

    Returns updated profile object

    Used in: New Requests Screen, Approved Requests Screen

END

// ============================================================

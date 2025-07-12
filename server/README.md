# SyncFit Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

3. For Gmail setup (OTP emails):
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: Google Account → Security → App Passwords
   - Use the generated password in EMAIL_PASS

4. Start the server:
```bash
npm start
```

## OTP Verification

The app now includes OTP verification for both signup and login:

- **Signup**: Users must verify their email with OTP before account creation
- **Login**: OTP is optional for additional security

## API Endpoints

- `POST /api/auth/send-otp` - Send OTP for registration
- `POST /api/auth/send-login-otp` - Send OTP for login
- `POST /api/auth/register` - Register with OTP verification
- `POST /api/auth/login` - Login with optional OTP
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile
- `PATCH /api/auth/password` - Update password
- `POST /api/auth/profile-image` - Upload profile image
- `DELETE /api/auth/profile-image` - Remove profile image
- `DELETE /api/auth/profile` - Delete account 
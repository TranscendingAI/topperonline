# PIN Authentication

The Suburban Toppers CRM is protected by a 4-digit PIN authentication layer.

## How It Works

1. **Middleware Protection**: All routes (except `/auth/pin` and static assets) are protected by Next.js middleware that checks for a valid authentication cookie.

2. **PIN Entry**: Users are redirected to `/auth/pin` where they enter a 4-digit PIN code.

3. **Session Management**: Upon successful authentication, a secure HTTP-only cookie is set that expires after 8 hours.

4. **Logout**: Users can log out via the logout button in the sidebar (door icon), which clears the authentication cookie and redirects to the PIN entry page.

## Configuration

The PIN is configured via environment variable in `.env.local`:

```bash
PIN_CODE=1234  # Change this to your desired 4-digit PIN
```

**Default PIN**: `1234` (if not configured)

## Deployment

When deploying to production:

1. Add `PIN_CODE` environment variable to your deployment platform (Vercel, Railway, etc.)
2. Use a secure 4-digit PIN (not the default `1234`)
3. The authentication cookie is automatically secured in production (`httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`)

## Files Modified

### Core Authentication Files
- `src/middleware.ts` - Route protection middleware
- `src/app/auth/pin/page.tsx` - PIN entry UI
- `src/app/api/auth/verify-pin/route.ts` - PIN verification API
- `src/app/api/auth/logout/route.ts` - Logout API

### Modified Existing Files
- `src/components/layout/Sidebar.tsx` - Added logout button with LogOut icon

### Configuration
- `.env.local` - PIN configuration (not committed to git)
- `.env.example` - Example environment variables

## Security Features

- **HTTP-only cookies**: Prevents XSS attacks from stealing the session
- **8-hour session timeout**: Automatic logout after 8 hours of authentication
- **Secure cookies in production**: HTTPS-only in production environments
- **Client-side validation**: Only accepts numeric 4-digit input
- **Auto-focus & paste support**: UX optimizations for fast PIN entry
- **Error feedback**: Visual shake animation and error message on incorrect PIN

## User Experience

- **Auto-advance**: Automatically moves to next input on digit entry
- **Backspace navigation**: Backspace on empty field moves to previous input
- **Paste support**: Can paste full 4-digit PIN (validates format)
- **Auto-submit**: Automatically verifies PIN when 4th digit is entered
- **Keyboard accessible**: Full keyboard navigation support
- **Mobile optimized**: Numeric keyboard on mobile devices (`inputMode="numeric"`)

## Changing the PIN

1. Update `PIN_CODE` in `.env.local` (or your deployment's environment variables)
2. Restart the development server (or redeploy for production)
3. All existing sessions remain valid until they expire (8 hours) or users log out

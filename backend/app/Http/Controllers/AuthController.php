<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'user',
            'avatar' => null,
            'phone' => null,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 1. Admin Override Check
        if ($request->email === env('ADMIN_EMAIL') && $request->password === env('ADMIN_PASSWORD')) {
            $user = User::firstOrCreate(
                ['email' => env('ADMIN_EMAIL')],
                [
                    'name' => 'System Administrator',
                    'password' => Hash::make(env('ADMIN_PASSWORD')),
                    'role' => 'admin',
                ]
            );

            // Ensure password is correct even if record existed with different password
            if (!Hash::check(env('ADMIN_PASSWORD'), $user->password)) {
                $user->password = Hash::make(env('ADMIN_PASSWORD'));
                $user->save();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'admin',
                'token' => $token,
            ]);
        }

        // 2. Database User Check
        $user = User::where('email', $request->email)->first();

        // Node backend allows both hashed check and fallback check (due to seed passwords possibly not being hashed in the beginning)
        // We will allow both normal check and plain-text check for safety in migration
        if ($user) {
            $isPasswordCorrect = Hash::check($request->password, $user->password) || ($request->password === $user->password);
            
            if ($isPasswordCorrect) {
                if ($user->is_blocked) {
                    return response()->json(['message' => 'This account has been suspended'], 403);
                }

                // Update last login
                $user->update(['last_login' => now()]);

                // Auto-upgrade password hash if plain-text password was matched
                if ($request->password === $user->password && !Hash::needsRehash($user->password)) {
                    $user->update(['password' => Hash::make($request->password)]);
                }

                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'token' => $token,
                ]);
            }
        }

        return response()->json(['message' => 'Invalid email or password'], 401);
    }

    public function googleLogin(Request $request)
    {
        $request->validate(['credential' => 'required|string']);
        $credential = $request->credential;

        try {
            // Retrieve Google Auth payload dynamically
            $client = new \Google\Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($credential);
            
            if (!$payload) {
                return response()->json(['message' => 'Google authentication failed'], 401);
            }

            $email = $payload['email'];
            $name = $payload['name'];

            $user = User::where('email', $email)->first();
            if (!$user) {
                $randomPassword = str_random(12);
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($randomPassword),
                    'role' => 'user'
                ]);
            }

            if ($user->is_blocked) {
                return response()->json(['message' => 'This account has been suspended'], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error('Google Login Error: ' . $e->getMessage());
            return response()->json(['message' => 'Google authentication failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function getMe(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'admin',
            ]);
        }

        $addresses = Address::where('user_id', $user->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(array_merge($user->toArray(), ['addresses' => $addresses]));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $user->update($request->only(['name', 'phone', 'avatar']));
        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        $user = $request->user();

        $isPasswordCorrect = Hash::check($request->currentPassword, $user->password) || ($request->currentPassword === $user->password);
        if (!$isPasswordCorrect) {
            return response()->json(['message' => 'Current password incorrect'], 400);
        }

        $user->update(['password' => Hash::make($request->newPassword)]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function getAddresses(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'desc')
            ->get();
        return response()->json($addresses);
    }

    public function addAddress(Request $request)
    {
        $userId = $request->user()->id;
        
        $isDefault = $request->input('isDefault') || $request->input('is_default') || false;
        if ($isDefault) {
            Address::where('user_id', $userId)->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id' => $userId,
            'full_name' => $request->input('fullName') ?: $request->input('full_name'),
            'street' => $request->street,
            'city' => $request->city,
            'zip' => $request->input('zip') ?: $request->input('zip_code'),
            'phone' => $request->phone,
            'is_default' => $isDefault,
        ]);

        return response()->json($address, 201);
    }

    public function deleteAddress(Request $request, $id)
    {
        Address::where('id', $id)->where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Address removed']);
    }

    public function updateAddress(Request $request, $id)
    {
        $userId = $request->user()->id;
        $address = Address::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $isDefault = $request->input('isDefault') || $request->input('is_default') || false;
        if ($isDefault) {
            Address::where('user_id', $userId)->update(['is_default' => false]);
        }

        $address->update([
            'full_name' => $request->input('fullName') ?: ($request->input('full_name') ?: $address->full_name),
            'street' => $request->street ?: $address->street,
            'city' => $request->city ?: $address->city,
            'zip' => $request->input('zip') ?: ($request->input('zip_code') ?: $address->zip),
            'phone' => $request->phone ?: $address->phone,
            'is_default' => $isDefault,
        ]);

        return response()->json(['message' => 'Address updated successfully']);
    }

    public function setDefaultAddress(Request $request, $id)
    {
        $userId = $request->user()->id;
        Address::where('user_id', $userId)->update(['is_default' => false]);
        Address::where('id', $id)->where('user_id', $userId)->update(['is_default' => true]);
        
        return response()->json(['message' => 'Default address updated']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->email;

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $otp = (string) rand(100000, 999999);
        $expiresAt = now()->addMinutes(5);

        DB::table('password_resets')->where('email', $email)->delete();
        DB::table('password_resets')->insert([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => $expiresAt
        ]);

        try {
            $htmlContent = '
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #b87333; text-align: center;">Montclair Security</h2>
                    <p>A request has been initiated to reset your security credentials.</p>
                    <p>Your one-time authentication code is:</p>
                    <div style="background: #f4f4f4; color: #b87333; padding: 20px; text-align: center; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                        ' . $otp . '
                    </div>
                    <p style="margin-top: 20px;">This code will expire in 5 minutes. If you did not request this, please ignore this transmission.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666; text-align: center;">This is an automated transmission. Please do not reply.</p>
                </div>';

            Mail::html($htmlContent, function ($message) use ($email) {
                $message->to($email)
                    ->subject('Security Access Code')
                    ->from(env('EMAIL_USER', 'prinspatel574@gmail.com'), 'Montclair Security');
            });

            return response()->json(['message' => 'Verification code sent to your email']);
        } catch (\Exception $e) {
            Log::error('Forgot Password Error: ' . $e->getMessage());
            return response()->json(['message' => 'Email dispatch failed', 'details' => $e->getMessage()], 500);
        }
    }

    public function verifyOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string'
        ]);

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        return response()->json(['success' => true, 'message' => 'Code verified']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'newPassword' => 'required|string|min:6'
        ]);

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->newPassword)]);

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully']);
    }
}

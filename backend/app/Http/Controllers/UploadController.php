<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    private function uploadToCloudinary($filePath)
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            Log::warning('Cloudinary credentials missing in .env');
            return null;
        }

        $timestamp = time();
        $signature = sha1("folder=montclair&timestamp=" . $timestamp . $apiSecret);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, [
            'file' => new \CURLFile($filePath),
            'timestamp' => $timestamp,
            'api_key' => $apiKey,
            'signature' => $signature,
            'folder' => 'montclair'
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return isset($data['secure_url']) ? $data['secure_url'] : null;
    }

    public function upload(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['success' => false, 'message' => 'No image file provided'], 400);
        }

        try {
            $file = $request->file('image');
            $url = $this->uploadToCloudinary($file->getRealPath());

            if (!$url) {
                return response()->json(['success' => false, 'message' => 'Image upload failed'], 500);
            }

            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        } catch (\Exception $e) {
            Log::error('UploadController Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Image upload failed'], 500);
        }
    }
}

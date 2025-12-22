<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class ImageController extends Controller
{
    /**
     * Upload product image
     */
    public function uploadProductImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120' // 5MB
        ]);

        $image = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        
        // Optimize image
        $img = Image::make($image);
        $img->resize(800, 800, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Save to storage
        $path = 'products/' . $filename;
        Storage::disk('public')->put($path, (string) $img->encode());
        
        return response()->json([
            'url' => Storage::url($path),
            'filename' => $filename
        ]);
    }

    /**
     * Upload category image
     */
    public function uploadCategoryImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048' // 2MB
        ]);

        $image = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        
        // Optimize image
        $img = Image::make($image);
        $img->resize(400, 400, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        $path = 'categories/' . $filename;
        Storage::disk('public')->put($path, (string) $img->encode());
        
        return response()->json([
            'url' => Storage::url($path),
            'filename' => $filename
        ]);
    }

    /**
     * Upload shop logo
     */
    public function uploadShopLogo(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048' // 2MB
        ]);

        $image = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        
        // Optimize image
        $img = Image::make($image);
        $img->resize(500, 500, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        $path = 'shops/' . $filename;
        Storage::disk('public')->put($path, (string) $img->encode());
        
        return response()->json([
            'url' => Storage::url($path),
            'filename' => $filename
        ]);
    }

    /**
     * Delete image
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'filename' => 'required|string'
        ]);

        $filename = $request->filename;
        
        // Try to delete from all possible locations
        $paths = [
            'products/' . $filename,
            'categories/' . $filename,
            'shops/' . $filename
        ];

        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                return response()->json(['message' => 'Image deleted successfully']);
            }
        }

        return response()->json(['message' => 'Image not found'], 404);
    }
}

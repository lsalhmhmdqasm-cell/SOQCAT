<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DistanceCalculator
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google.maps_key');
    }

    /**
     * Calculate distance and duration between two locations
     *
     * @param string $origin Origin address or coordinates
     * @param string $destination Destination address or coordinates
     * @return array|null
     */
    public function calculate($origin, $destination)
    {
        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/distancematrix/json', [
                'origins' => $origin,
                'destinations' => $destination,
                'key' => $this->apiKey,
                'language' => 'ar'
            ]);

            $data = $response->json();
            
            if ($data['status'] === 'OK' && isset($data['rows'][0]['elements'][0])) {
                $element = $data['rows'][0]['elements'][0];
                
                if ($element['status'] === 'OK') {
                    return [
                        'distance' => $element['distance']['value'], // meters
                        'duration' => $element['duration']['value'], // seconds
                        'distance_text' => $element['distance']['text'],
                        'duration_text' => $element['duration']['text']
                    ];
                }
            }

            Log::warning('Distance calculation failed', ['data' => $data]);
            return null;
        } catch (\Exception $e) {
            Log::error('Distance calculation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate delivery fee based on distance
     *
     * @param float $distanceInMeters
     * @return float
     */
    public function calculateDeliveryFee($distanceInMeters)
    {
        $distanceInKm = $distanceInMeters / 1000;
        
        // Pricing: 1 YER per km, minimum 5 YER
        $fee = max(5, $distanceInKm * 1);
        
        return round($fee, 2);
    }
}

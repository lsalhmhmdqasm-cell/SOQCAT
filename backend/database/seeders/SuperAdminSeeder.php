<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if super admin already exists
        if (User::where('email', 'admin@qatshop.com')->exists()) {
            $this->command->info('Super Admin already exists.');
            return;
        }

        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@qatshop.com',
            'phone' => 'admin',
            'password' => Hash::make('admin'),
            'role' => 'super_admin',
        ]);

        $this->command->info('Super Admin created successfully.');
        $this->command->info('Email: admin@qatshop.com');
        $this->command->info('Phone: admin');
        $this->command->info('Password: admin');
    }
}

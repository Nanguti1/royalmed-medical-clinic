<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoginSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'session_id' => fake()->uuid(),
            'ip_address' => fake()->optional()->ipv4(),
            'user_agent' => fake()->optional()->userAgent(),
            'device_type' => fake()->optional()->randomElement(['desktop', 'mobile', 'tablet']),
            'browser' => fake()->optional()->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            'platform' => fake()->optional()->randomElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
            'location' => fake()->optional()->randomElement([['lat' => fake()->latitude(), 'lng' => fake()->longitude()]]),
            'login_at' => fake()->dateTime('-30 days'),
            'logout_at' => fake()->optional()->dateTime('-25 days'),
            'last_activity_at' => fake()->optional()->dateTime('-26 days'),
            'status' => fake()->randomElement(['active', 'expired', 'logged_out', 'terminated']),
            'termination_reason' => fake()->optional()->sentence(),
        ];
    }
}

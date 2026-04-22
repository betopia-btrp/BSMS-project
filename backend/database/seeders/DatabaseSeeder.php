<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Building;
use App\Models\Flat;
use App\Models\MaintenanceTicket;
use App\Models\MaintenanceTicketNote;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\TenantProfile;
use App\Models\User;
use App\Models\Visitor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $building = Building::create([
                'name' => 'BSMS Central',
                'address' => 'Dhanmondi, Dhaka',
                'plan_tier' => 'premium',
            ]);

            $admin = User::create([
                'building_id' => $building->id,
                'name' => 'Admin Rahman',
                'email' => 'admin@bsms.com',
                'phone' => '01700000001',
                'role' => 'admin',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $owner = User::create([
                'building_id' => $building->id,
                'name' => 'Mr. Karim',
                'email' => 'owner@bsms.com',
                'phone' => '01700000002',
                'role' => 'owner',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $tenantUser = User::create([
                'building_id' => $building->id,
                'name' => 'Rahim Mia',
                'email' => 'tenant@bsms.com',
                'phone' => '01700000003',
                'role' => 'tenant',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $guard = User::create([
                'building_id' => $building->id,
                'name' => 'Guard Hasan',
                'email' => 'guard@bsms.com',
                'phone' => '01700000004',
                'role' => 'guard',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $ownerTwo = User::create([
                'building_id' => $building->id,
                'name' => 'Mrs. Sultana',
                'email' => 'owner2@bsms.com',
                'phone' => '01700000005',
                'role' => 'owner',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $tenantTwoUser = User::create([
                'building_id' => $building->id,
                'name' => 'Salam Ahmed',
                'email' => 'tenant2@bsms.com',
                'phone' => '01700000006',
                'role' => 'tenant',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $flat1 = Flat::create([
                'building_id' => $building->id,
                'owner_id' => $owner->id,
                'number' => 'A-101',
                'floor' => 1,
                'size_sqft' => 1200,
                'status' => 'occupied',
                'monthly_rent' => 25000,
            ]);

            $flat2 = Flat::create([
                'building_id' => $building->id,
                'owner_id' => $ownerTwo->id,
                'number' => 'A-102',
                'floor' => 1,
                'size_sqft' => 1400,
                'status' => 'vacant',
                'monthly_rent' => 30000,
            ]);

            $flat3 = Flat::create([
                'building_id' => $building->id,
                'owner_id' => $owner->id,
                'number' => 'B-201',
                'floor' => 2,
                'size_sqft' => 1100,
                'status' => 'occupied',
                'monthly_rent' => 22000,
            ]);

            $flat4 = Flat::create([
                'building_id' => $building->id,
                'number' => 'B-202',
                'floor' => 2,
                'size_sqft' => 1300,
                'status' => 'maintenance',
                'monthly_rent' => 28000,
            ]);

            $flat5 = Flat::create([
                'building_id' => $building->id,
                'owner_id' => $ownerTwo->id,
                'number' => 'C-301',
                'floor' => 3,
                'size_sqft' => 1500,
                'status' => 'vacant',
                'monthly_rent' => 35000,
            ]);

            $flat6 = Flat::create([
                'building_id' => $building->id,
                'owner_id' => $owner->id,
                'number' => 'C-302',
                'floor' => 3,
                'size_sqft' => 1600,
                'status' => 'vacant',
                'monthly_rent' => 38000,
            ]);

            $tenantOne = TenantProfile::create([
                'user_id' => $tenantUser->id,
                'flat_id' => $flat1->id,
                'national_id' => '1234567890',
                'emergency_contact' => '01800000001',
                'move_in_date' => '2024-02-01',
                'monthly_rent' => 25000,
                'is_active' => true,
            ]);

            $tenantTwo = TenantProfile::create([
                'user_id' => $tenantTwoUser->id,
                'flat_id' => $flat3->id,
                'national_id' => '0987654321',
                'move_in_date' => '2024-03-01',
                'monthly_rent' => 22000,
                'is_active' => true,
            ]);

            Payment::insert([
                [
                    'tenant_profile_id' => $tenantOne->id,
                    'flat_id' => $flat1->id,
                    'owner_id' => $owner->id,
                    'amount' => 25000,
                    'type' => 'rent',
                    'status' => 'paid',
                    'method' => 'bkash',
                    'billing_month' => '2025-04',
                    'due_date' => '2025-04-05',
                    'paid_at' => '2025-04-03 10:00:00',
                    'invoice_number' => 'INV-2025-001',
                    'recipient' => 'owner',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'tenant_profile_id' => $tenantOne->id,
                    'flat_id' => $flat1->id,
                    'owner_id' => null,
                    'amount' => 3500,
                    'type' => 'service_charge',
                    'status' => 'paid',
                    'method' => 'nagad',
                    'billing_month' => '2025-04',
                    'due_date' => '2025-04-05',
                    'paid_at' => '2025-04-03 10:00:00',
                    'invoice_number' => 'INV-2025-002',
                    'recipient' => 'admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'tenant_profile_id' => $tenantTwo->id,
                    'flat_id' => $flat3->id,
                    'owner_id' => $owner->id,
                    'amount' => 22000,
                    'type' => 'rent',
                    'status' => 'unpaid',
                    'method' => null,
                    'billing_month' => '2025-04',
                    'due_date' => '2025-04-05',
                    'paid_at' => null,
                    'invoice_number' => 'INV-2025-003',
                    'recipient' => 'owner',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'tenant_profile_id' => $tenantTwo->id,
                    'flat_id' => $flat3->id,
                    'owner_id' => null,
                    'amount' => 3500,
                    'type' => 'service_charge',
                    'status' => 'overdue',
                    'method' => null,
                    'billing_month' => '2025-03',
                    'due_date' => '2025-03-05',
                    'paid_at' => null,
                    'invoice_number' => 'INV-2025-004',
                    'recipient' => 'admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            $ticket1 = MaintenanceTicket::create([
                'ticket_code' => 'TKT-001',
                'tenant_profile_id' => $tenantOne->id,
                'flat_id' => $flat1->id,
                'category' => 'plumbing',
                'description' => 'Water leakage in bathroom pipe',
                'status' => 'in_progress',
                'priority' => 'high',
                'created_at' => '2025-04-10 10:00:00',
                'updated_at' => '2025-04-11 14:00:00',
            ]);

            $ticket2 = MaintenanceTicket::create([
                'ticket_code' => 'TKT-002',
                'tenant_profile_id' => $tenantTwo->id,
                'flat_id' => $flat3->id,
                'category' => 'electrical',
                'description' => 'Ceiling fan not working',
                'status' => 'open',
                'priority' => 'medium',
                'created_at' => '2025-04-15 09:00:00',
                'updated_at' => '2025-04-15 09:00:00',
            ]);

            $ticket3 = MaintenanceTicket::create([
                'ticket_code' => 'TKT-003',
                'tenant_profile_id' => $tenantOne->id,
                'flat_id' => $flat1->id,
                'category' => 'carpentry',
                'description' => 'Door hinge broken',
                'status' => 'resolved',
                'priority' => 'low',
                'resolved_at' => '2025-04-10 16:00:00',
                'created_at' => '2025-04-08 11:00:00',
                'updated_at' => '2025-04-10 16:00:00',
            ]);

            MaintenanceTicketNote::insert([
                [
                    'maintenance_ticket_id' => $ticket1->id,
                    'user_id' => $admin->id,
                    'note' => 'Assigned to plumber',
                    'created_at' => '2025-04-10 12:00:00',
                    'updated_at' => '2025-04-10 12:00:00',
                ],
                [
                    'maintenance_ticket_id' => $ticket1->id,
                    'user_id' => $admin->id,
                    'note' => 'Parts ordered',
                    'created_at' => '2025-04-11 14:00:00',
                    'updated_at' => '2025-04-11 14:00:00',
                ],
                [
                    'maintenance_ticket_id' => $ticket3->id,
                    'user_id' => $admin->id,
                    'note' => 'Fixed on 10th April',
                    'created_at' => '2025-04-10 16:00:00',
                    'updated_at' => '2025-04-10 16:00:00',
                ],
            ]);

            Visitor::create([
                'building_id' => $building->id,
                'flat_id' => $flat1->id,
                'tenant_profile_id' => $tenantOne->id,
                'guard_id' => $guard->id,
                'name' => 'Jamal Hossain',
                'phone' => '01900000001',
                'national_id' => null,
                'purpose' => 'Family visit',
                'type' => 'expected',
                'status' => 'arrived',
                'visit_date' => '2025-04-21',
                'expected_time' => '14:00:00',
                'entry_time' => '2025-04-21 14:05:00',
                'exit_time' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Visitor::create([
                'building_id' => $building->id,
                'flat_id' => $flat3->id,
                'tenant_profile_id' => $tenantTwo->id,
                'guard_id' => $guard->id,
                'name' => 'Delivery Man',
                'phone' => '01900000002',
                'national_id' => null,
                'purpose' => null,
                'type' => 'walkin',
                'status' => 'exited',
                'visit_date' => null,
                'expected_time' => null,
                'entry_time' => '2025-04-22 11:00:00',
                'exit_time' => '2025-04-22 11:15:00',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Visitor::create([
                'building_id' => $building->id,
                'flat_id' => $flat1->id,
                'tenant_profile_id' => $tenantOne->id,
                'guard_id' => null,
                'name' => 'Fatima Begum',
                'phone' => '01900000003',
                'national_id' => null,
                'purpose' => 'Personal',
                'type' => 'expected',
                'status' => 'pending',
                'visit_date' => '2025-04-22',
                'expected_time' => '16:00:00',
                'entry_time' => null,
                'exit_time' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $announcement1 = Announcement::create([
                'building_id' => $building->id,
                'author_id' => $admin->id,
                'title' => 'Water Supply Maintenance',
                'content' => 'Water supply will be shut down on April 23rd from 10 AM to 2 PM for maintenance work. Please store water accordingly.',
                'target_role' => 'all',
                'created_at' => '2025-04-20 10:00:00',
                'updated_at' => '2025-04-20 10:00:00',
            ]);

            $announcement2 = Announcement::create([
                'building_id' => $building->id,
                'author_id' => $admin->id,
                'title' => 'Monthly Society Meeting',
                'content' => 'There will be a monthly society meeting on April 28th at 6 PM in the community hall. All owners are requested to attend.',
                'target_role' => 'owner',
                'created_at' => '2025-04-18 09:00:00',
                'updated_at' => '2025-04-18 09:00:00',
            ]);

            $announcement1->readers()->attach($tenantUser->id, ['read_at' => '2025-04-20 12:00:00']);

            Notification::create([
                'user_id' => $tenantUser->id,
                'title' => 'Payment Due',
                'message' => 'Your April service charge is due on April 30th.',
                'type' => 'payment',
                'read' => false,
                'read_at' => null,
                'created_at' => '2025-04-20 08:00:00',
                'updated_at' => '2025-04-20 08:00:00',
            ]);

            Notification::create([
                'user_id' => $tenantUser->id,
                'title' => 'Maintenance Update',
                'message' => 'Your plumbing ticket TKT-001 is in progress.',
                'type' => 'maintenance',
                'read' => true,
                'read_at' => '2025-04-11 14:00:00',
                'created_at' => '2025-04-11 14:00:00',
                'updated_at' => '2025-04-11 14:00:00',
            ]);

            Notification::create([
                'user_id' => $owner->id,
                'title' => 'Rent Received',
                'message' => 'Rahim Mia has paid April rent for Flat A-101.',
                'type' => 'payment',
                'read' => false,
                'read_at' => null,
                'created_at' => '2025-04-03 10:00:00',
                'updated_at' => '2025-04-03 10:00:00',
            ]);
        });
    }
}

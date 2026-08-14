<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentReminder;
use App\Models\DoctorSchedule;
use App\Models\WaitlistEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function createAppointment(array $data): Appointment
    {
        return DB::transaction(function () use ($data) {
            $this->checkForDoubleBooking($data);

            $appointment = Appointment::create([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'] ?? null,
                'dental_chair_id' => $data['dental_chair_id'] ?? null,
                'visit_id' => $data['visit_id'] ?? null,
                'consultation_id' => $data['consultation_id'] ?? null,
                'appointment_date' => $data['appointment_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'appointment_type' => $data['appointment_type'] ?? 'consultation',
                'status' => 'scheduled',
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
                'is_walk_in' => $data['is_walk_in'] ?? false,
                'is_follow_up' => $data['is_follow_up'] ?? false,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            if (isset($data['schedule_reminder']) && $data['schedule_reminder']) {
                $this->scheduleReminder($appointment, $data['reminder_type'] ?? 'sms');
            }

            return $appointment;
        });
    }

    public function checkForDoubleBooking(array $data): void
    {
        if (! isset($data['doctor_id']) || ! isset($data['appointment_date'])) {
            return;
        }

        $startTime = Carbon::parse($data['start_time']);
        $endTime = Carbon::parse($data['end_time']);

        $existing = Appointment::where('doctor_id', $data['doctor_id'])
            ->where('appointment_date', $data['appointment_date'])
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'no_show')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($existing) {
            throw new \RuntimeException('Double booking detected: Doctor already has an appointment during this time slot');
        }
    }

    public function scheduleReminder(Appointment $appointment, string $type = 'sms'): AppointmentReminder
    {
        $reminderTime = $appointment->appointment_date->subHours(24);

        return $appointment->reminders()->create([
            'reminder_type' => $type,
            'is_sent' => false,
            'scheduled_at' => $reminderTime,
        ]);
    }

    public function cancelAppointment(Appointment $appointment, string $reason): void
    {
        DB::transaction(function () use ($appointment, $reason) {
            $appointment->cancel($reason);
            $appointment->reminders()->delete();
        });
    }

    public function markAsNoShow(Appointment $appointment): void
    {
        $appointment->markAsNoShow();
    }

    public function confirmAppointment(Appointment $appointment): void
    {
        $appointment->confirm();
    }

    public function rescheduleAppointment(Appointment $appointment, array $newData): Appointment
    {
        return DB::transaction(function () use ($appointment, $newData) {
            $this->checkForDoubleBooking($newData);

            $appointment->update([
                'appointment_date' => $newData['appointment_date'],
                'start_time' => $newData['start_time'],
                'end_time' => $newData['end_time'],
                'status' => 'rescheduled',
                'notes' => $newData['notes'] ?? $appointment->notes,
                'updated_by' => auth()->id(),
            ]);

            $newAppointment = Appointment::create([
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $newData['doctor_id'] ?? $appointment->doctor_id,
                'dental_chair_id' => $newData['dental_chair_id'] ?? $appointment->dental_chair_id,
                'appointment_date' => $newData['appointment_date'],
                'start_time' => $newData['start_time'],
                'end_time' => $newData['end_time'],
                'appointment_type' => $appointment->appointment_type,
                'status' => 'scheduled',
                'reason' => $appointment->reason,
                'notes' => $newData['notes'] ?? null,
                'is_follow_up' => $appointment->is_follow_up,
                'created_by' => auth()->id(),
            ]);

            return $newAppointment;
        });
    }

    public function checkInPatient(Appointment $appointment): void
    {
        $appointment->checkIn();
    }

    public function checkOutPatient(Appointment $appointment): void
    {
        $appointment->checkOut();
    }

    public function addToWaitlist(array $data): WaitlistEntry
    {
        return WaitlistEntry::create([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $data['doctor_id'] ?? null,
            'dental_chair_id' => $data['dental_chair_id'] ?? null,
            'appointment_type' => $data['appointment_type'] ?? 'consultation',
            'reason' => $data['reason'] ?? null,
            'notes' => $data['notes'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);
    }

    public function getAvailableSlots(int $doctorId, string $date): array
    {
        $dayOfWeek = Carbon::parse($date)->format('l');

        $schedule = DoctorSchedule::byDoctor($doctorId)
            ->byDay($dayOfWeek)
            ->available()
            ->first();

        if (! $schedule) {
            return [];
        }

        $existingAppointments = Appointment::byDoctor($doctorId)
            ->byDate($date)
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'no_show')
            ->get();

        $slots = [];
        $currentStart = Carbon::parse($date.' '.$schedule->start_time);
        $endTime = Carbon::parse($date.' '.$schedule->end_time);

        while ($currentStart < $endTime) {
            $slotEnd = $currentStart->copy()->addMinutes(30);
            $isAvailable = true;

            foreach ($existingAppointments as $appointment) {
                $aptStart = Carbon::parse($appointment->start_time);
                $aptEnd = Carbon::parse($appointment->end_time);

                if ($currentStart < $aptEnd && $slotEnd > $aptStart) {
                    $isAvailable = false;
                    break;
                }
            }

            if ($isAvailable) {
                $slots[] = [
                    'start' => $currentStart->format('H:i'),
                    'end' => $slotEnd->format('H:i'),
                ];
            }

            $currentStart = $slotEnd;
        }

        return $slots;
    }

    public function getDoctorAvailability(int $doctorId, string $startDate, string $endDate): array
    {
        $availability = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($start <= $end) {
            $dayOfWeek = $start->format('l');
            $schedule = DoctorSchedule::byDoctor($doctorId)
                ->byDay($dayOfWeek)
                ->available()
                ->first();

            $availability[$start->toDateString()] = $schedule ? [
                'is_available' => true,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'session_type' => $schedule->session_type,
            ] : [
                'is_available' => false,
            ];

            $start->addDay();
        }

        return $availability;
    }
}

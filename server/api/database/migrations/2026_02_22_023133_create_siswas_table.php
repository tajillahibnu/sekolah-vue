<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('tingkat_id')->nullable()->constrained('tingkats')->nullOnDelete();
            // Identitas
            $table->string('nis')->nullable()->unique();
            $table->string('nisn')->nullable()->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->enum('gender', ['L', 'P'])->nullable();
            
            // Kelahiran & Agama
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('religion')->nullable();

            // Kontak & Lokasi
            $table->string('phone')->nullable();
            $table->text('address')->nullable();

            // Status & Akademik
            $table->enum('status', ['active', 'inactive', 'graduated', 'transferred'])->default('active');
            $table->date('join_date')->nullable();
            $table->string('previous_school')->nullable();
            $table->decimal('entry_score', 5, 2)->nullable();

            // Lain-lain
            $table->json('achievements')->nullable();
            $table->string('avatar')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};

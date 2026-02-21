<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->enum('semester', ['Ganjil', 'Genap']);
            
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            // Batas waktu aktivitas krusial
            $table->dateTime('uts_input_deadline')->nullable();
            $table->dateTime('uas_input_deadline')->nullable();
            $table->dateTime('report_release_date')->nullable();
            
            // Penanda aktif per term
            $table->boolean('is_active')->default(false);
            
            $table->timestamps();

            // Cegah duplikasi tahun dan semester (Misal: 2025/2026 Ganjil cuma boleh exist 1 row)
            $table->unique(['academic_year_id', 'semester']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};

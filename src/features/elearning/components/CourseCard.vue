<template>
    <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer group"
        @click="$emit('click')">
        <div class="h-40 bg-gray-100 relative overflow-hidden">
            <img v-if="course.thumbnail" :src="course.thumbnail" alt="Course Thumbnail"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                <BookOpenIcon class="w-16 h-16" />
            </div>
            <div
                class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-indigo-50">
                {{ course.subject }}
            </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
            <h3 class="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {{ course.title }}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{{ course.description }}</p>

            <div class="mt-auto">
                <div v-if="role === 'student'" class="mb-4">
                    <div class="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                        <span>Progress Belajar</span>
                        <span class="text-indigo-600">{{ course.progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div class="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                            :style="{ width: course.progress + '%' }"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                    <div class="flex items-center gap-1.5">
                        <UserCircleIcon class="w-4 h-4 text-gray-400" />
                        <span class="truncate max-w-[100px]">{{ course.teacherName }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-gray-600">
                        <AcademicCapIcon class="w-3.5 h-3.5" />
                        <span>Kelas {{ course.grade }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BookOpenIcon, UserCircleIcon, AcademicCapIcon } from '@heroicons/vue/24/outline';

defineProps({
    course: {
        type: Object,
        required: true
    },
    role: {
        type: String,
        default: 'student' // 'student' or 'teacher'
    }
});

defineEmits(['click']);
</script>

<template>
    <div class="space-y-4">
        <div v-for="(module, index) in modules" :key="module.id"
            class="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div class="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                @click="toggleModule(module.id)">
                <div class="flex items-center gap-3">
                    <div
                        class="bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-gray-500">
                        {{ index + 1 }}
                    </div>
                    <h3 class="font-semibold text-gray-800">{{ module.title }}</h3>
                </div>
                <ChevronDownIcon class="w-5 h-5 text-gray-400 transition-transform duration-300"
                    :class="{ 'transform rotate-180': isOpen(module.id) }" />
            </div>

            <div v-show="isOpen(module.id)" class="border-t border-gray-200 divide-y divide-gray-100">
                <div v-for="lesson in module.lessons" :key="lesson.id"
                    class="p-4 pl-14 hover:bg-indigo-50 transition-colors flex items-center justify-between group cursor-pointer"
                    @click="$emit('select-lesson', lesson)">
                    <div class="flex items-center gap-3">
                        <component :is="getIcon(lesson.type)"
                            class="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        <span class="text-gray-700 group-hover:text-indigo-700 text-sm">{{ lesson.title }}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span v-if="lesson.duration" class="text-xs text-gray-400">{{ lesson.duration }}</span>
                        <span v-if="lesson.type === 'quiz'" class="text-xs text-gray-400">{{ lesson.questions }}
                            Soal</span>
                        <CheckCircleIcon v-if="lesson.completed" class="w-5 h-5 text-green-500" />
                        <div v-else class="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                    </div>
                </div>
                <div v-if="module.lessons.length === 0" class="p-4 pl-14 text-sm text-gray-400 italic">
                    Belum ada materi.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    ChevronDownIcon,
    PlayCircleIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    CheckCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    modules: {
        type: Array,
        required: true
    }
});

defineEmits(['select-lesson']);

const openModules = ref({});

// Initialize all open by default
// const openModules = ref(props.modules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {}));

const toggleModule = (id) => {
    openModules.value[id] = !openModules.value[id];
};

const isOpen = (id) => {
    return openModules.value[id] !== false; // Default to open
};

const getIcon = (type) => {
    switch (type) {
        case 'video': return PlayCircleIcon;
        case 'quiz': return ClipboardDocumentCheckIcon;
        default: return DocumentTextIcon;
    }
};
</script>

<script setup>
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import FormTextarea from '@/components/ui/form/FormTextarea.vue'
import FormCheckbox from '@/components/ui/form/FormCheckbox.vue'
import FormRadioGroup from '@/components/ui/form/FormRadioGroup.vue'
import FormSwitch from '@/components/ui/form/FormSwitch.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertTitle from '@/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import Progress from '@/components/ui/progress/Progress.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { Terminal, AlertCircle } from 'lucide-vue-next'

// Form data
const formData = ref({
    name: '',
    email: '',
    role: '',
    message: '',
    terms: false,
    notifications: 'all',
    marketing: false
})

// Errors
const errors = ref({})

// Options
const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Guru' },
    { value: 'student', label: 'Siswa' }
]

const notificationOptions = [
    { value: 'all', label: 'All notifications' },
    { value: 'important', label: 'Important only' },
    { value: 'none', label: 'None' }
]

// Progress
const progress = ref(45)

// Handle submit
const handleSubmit = () => {
    errors.value = {}

    if (!formData.value.name) {
        errors.value.name = 'Nama wajib diisi'
    }

    if (!formData.value.email) {
        errors.value.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Format email tidak valid'
    }

    if (!formData.value.role) {
        errors.value.role = 'Role wajib dipilih'
    }

    if (!formData.value.terms) {
        errors.value.terms = 'Anda harus menyetujui terms and conditions'
    }

    if (Object.keys(errors.value).length === 0) {
        alert('Form submitted successfully!')
        console.log('Form data:', formData.value)
    }
}
</script>

<template>
    <div class="container mx-auto p-8 max-w-6xl">
        <div class="space-y-8">
            <!-- Header -->
            <div>
                <h1 class="text-4xl font-bold">shadcn-vue Components</h1>
                <p class="text-muted-foreground mt-2">
                    Comprehensive showcase of all shadcn-vue components
                </p>
            </div>

            <Separator />

            <!-- Buttons -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Buttons</h2>
                    <p class="text-sm text-muted-foreground">Different button variants and sizes</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                </div>
            </section>

            <Separator />

            <!-- Badges -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Badges</h2>
                    <p class="text-sm text-muted-foreground">Status indicators and labels</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                </div>
            </section>

            <Separator />

            <!-- Cards -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Cards</h2>
                    <p class="text-sm text-muted-foreground">Container components with header, content, and footer</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card description goes here</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm">This is the card content area.</p>
                        </CardContent>
                        <CardFooter>
                            <Button class="w-full">Action</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>With Badge</CardTitle>
                            <CardDescription>Card with status badge</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="flex items-center gap-2">
                                <Badge>Active</Badge>
                                <span class="text-sm">Status indicator</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>With Avatar</CardTitle>
                            <CardDescription>Card with user avatar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="flex items-center gap-3">
                                <Avatar src="https://ui-avatars.com/api/?name=John+Doe&background=6366F1&color=fff"
                                    alt="John Doe" fallback="JD" />
                                <div>
                                    <p class="text-sm font-medium">John Doe</p>
                                    <p class="text-xs text-muted-foreground">john@example.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator />

            <!-- Alerts -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Alerts</h2>
                    <p class="text-sm text-muted-foreground">Important messages and notifications</p>
                </div>
                <Alert>
                    <Terminal class="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        You can add components to your app using the cli.
                    </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Your session has expired. Please log in again.
                    </AlertDescription>
                </Alert>
            </section>

            <Separator />

            <!-- Progress & Skeleton -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Progress & Loading</h2>
                    <p class="text-sm text-muted-foreground">Progress bars and skeleton loaders</p>
                </div>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm">Progress</span>
                            <span class="text-sm text-muted-foreground">{{ progress }}%</span>
                        </div>
                        <Progress :value="progress" />
                    </div>
                    <div class="space-y-2">
                        <Skeleton class="h-4 w-full" />
                        <Skeleton class="h-4 w-3/4" />
                        <Skeleton class="h-4 w-1/2" />
                    </div>
                </div>
            </section>

            <Separator />

            <!-- Form Components -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Form Components</h2>
                    <p class="text-sm text-muted-foreground">Complete form with all input types</p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput v-model="formData.name" label="Name" placeholder="Enter your name" :required="true"
                            :error="errors.name" />

                        <FormInput v-model="formData.email" label="Email" type="email" placeholder="email@example.com"
                            :required="true" :error="errors.email" />
                    </div>

                    <FormSelect v-model="formData.role" label="Role" :options="roleOptions"
                        placeholder="Select your role" :required="true" :error="errors.role" />

                    <FormTextarea v-model="formData.message" label="Message" placeholder="Write your message..."
                        :rows="4" />

                    <Separator />

                    <FormCheckbox v-model="formData.terms" label="Accept terms and conditions"
                        description="You agree to our Terms of Service and Privacy Policy." :error="errors.terms" />

                    <FormRadioGroup v-model="formData.notifications" label="Email Notifications"
                        :options="notificationOptions" />

                    <FormSwitch v-model="formData.marketing" label="Marketing emails"
                        description="Receive emails about new products, features, and more." />

                    <Separator />

                    <div class="flex gap-3">
                        <Button type="submit">Submit</Button>
                        <Button type="button" variant="outline"
                            @click="formData = { name: '', email: '', role: '', message: '', terms: false, notifications: 'all', marketing: false }">
                            Reset
                        </Button>
                    </div>
                </form>
            </section>

            <Separator />

            <!-- Form Data Preview -->
            <section class="space-y-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Form Data (Live Preview)</h2>
                    <p class="text-sm text-muted-foreground">Real-time form data</p>
                </div>
                <pre class="bg-muted p-4 rounded-md text-sm overflow-auto">{{ JSON.stringify(formData, null, 2) }}</pre>
            </section>
        </div>
    </div>
</template>

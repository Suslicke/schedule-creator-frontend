<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Day Schedule Creator</h1>

    <!-- Step Indicator -->
    <div class="card p-6">
      <div class="flex items-center justify-between">
        <div v-for="(step, index) in steps" :key="index" class="flex-1">
          <div class="flex items-center">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all', 
              currentStep > index ? 'bg-green-500 text-white' : 
              currentStep === index ? 'bg-blue-600 text-white ring-4 ring-blue-200' : 
              'bg-gray-200 text-gray-500']">
              {{ currentStep > index ? '✓' : index + 1 }}
            </div>
            <div v-if="index < steps.length - 1" :class="['flex-1 h-1 mx-2 transition-all', currentStep > index ? 'bg-green-500' : 'bg-gray-200']"></div>
          </div>
          <div :class="['mt-2 text-sm font-medium', currentStep === index ? 'text-blue-600' : 'text-gray-500']">
            {{ step }}
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: Date & Group Selection -->
    <div v-if="currentStep === 0" class="card p-8">
      <h2 class="text-2xl font-semibold mb-6">Select Date & Group</h2>
      <div class="space-y-6 max-w-md">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker v-model="form.date" class="w-full" />
          <p class="mt-1 text-xs text-gray-500">Select the date for which you want to create a schedule</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Group (Optional)</label>
          <input v-model="form.group_name" class="input-text w-full" placeholder="Leave empty for all groups" />
          <p class="mt-1 text-xs text-gray-500">Specify a group or leave empty to create for all groups</p>
        </div>
        <button @click="nextStep" :disabled="!form.date" class="btn-primary w-full py-3">
          Continue to Configuration →
        </button>
      </div>
    </div>

    <!-- Step 2: Configuration -->
    <div v-if="currentStep === 1" class="card p-8">
      <h2 class="text-2xl font-semibold mb-6">Configure Schedule Generation</h2>
      <div class="space-y-6 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"  @click="form.from_plan = !form.from_plan">
            <input type="checkbox" v-model="form.from_plan" class="mt-1" />
            <div>
              <p class="font-medium text-gray-900">Copy from Weekly Plan</p>
              <p class="text-sm text-gray-600">Use the weekly template as a starting point</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="form.enforce_no_gaps = !form.enforce_no_gaps">
            <input type="checkbox" v-model="form.enforce_no_gaps" class="mt-1" />
            <div>
              <p class="font-medium text-gray-900">No Gaps</p>
              <p class="text-sm text-gray-600">Avoid empty slots between classes</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="form.allow_repeated_subjects = !form.allow_repeated_subjects">
            <input type="checkbox" v-model="form.allow_repeated_subjects" class="mt-1" />
            <div>
              <p class="font-medium text-gray-900">Allow Repeated Subjects</p>
              <p class="text-sm text-gray-600">Same subject can appear multiple times per day</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" @click="form.use_both_shifts = !form.use_both_shifts">
            <input type="checkbox" v-model="form.use_both_shifts" class="mt-1" />
            <div>
              <p class="font-medium text-gray-900">Use Both Shifts</p>
              <p class="text-sm text-gray-600">Schedule can span morning and evening shifts</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max Repeats per Subject</label>
            <input v-model.number="form.max_repeats_per_subject" type="number" min="1" max="10" class="input-text w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max Pairs per Day</label>
            <input v-model.number="form.max_pairs_per_day" type="number" min="1" max="8" class="input-text w-full" />
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="previousStep" class="btn-secondary flex-1 py-3">
            ← Back
          </button>
          <button @click="nextStep" class="btn-primary flex-1 py-3">
            Continue to Generation →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Generate -->
    <div v-if="currentStep === 2" class="card p-8">
      <h2 class="text-2xl font-semibold mb-6">Generate Schedule</h2>
      
      <div v-if="!generated" class="max-w-md">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 class="font-semibold text-blue-900 mb-2">Ready to Generate</h3>
          <div class="text-sm text-blue-800 space-y-1">
            <p>📅 Date: <strong>{{ form.date }}</strong></p>
            <p v-if="form.group_name">👥 Group: <strong>{{ form.group_name }}</strong></p>
            <p v-else>👥 Group: <strong>All groups</strong></p>
            <p>📋 From plan: <strong>{{ form.from_plan ? 'Yes' : 'No' }}</strong></p>
            <p>🔢 Max pairs/day: <strong>{{ form.max_pairs_per_day }}</strong></p>
          </div>
        </div>

        <button @click="generate" :disabled="loading" class="btn-primary w-full py-4 text-lg">
          <span v-if="loading">Generating...</span>
          <span v-else>✨ Generate Schedule</span>
        </button>
        <button @click="previousStep" :disabled="loading" class="btn-secondary w-full py-3 mt-3">
          ← Back to Configuration
        </button>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
              ✓
            </div>
            <div>
              <h3 class="font-semibold text-green-900">Schedule Generated Successfully!</h3>
              <p class="text-sm text-green-800">The schedule has been created. Review it below before approving.</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-green-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-700">{{ dayData?.diff_counters?.added ?? 0 }}</div>
            <div class="text-xs text-green-600">Added</div>
          </div>
          <div class="bg-red-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-red-700">{{ dayData?.diff_counters?.removed ?? 0 }}</div>
            <div class="text-xs text-red-600">Removed</div>
          </div>
          <div class="bg-yellow-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-700">{{ dayData?.diff_counters?.changed ?? 0 }}</div>
            <div class="text-xs text-yellow-600">Changed</div>
          </div>
          <div class="bg-gray-100 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-700">{{ dayData?.diff_counters?.same ?? 0 }}</div>
            <div class="text-xs text-gray-600">Unchanged</div>
          </div>
        </div>

        <!-- Schedule Preview -->
        <div class="border rounded-lg overflow-hidden">
          <div class="bg-gray-50 border-b px-4 py-3">
            <h3 class="font-semibold">Schedule Preview</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(entry, i) in previewEntries" :key="i" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ entry.start_time }}–{{ entry.end_time }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ entry.subject_name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ entry.group_name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">{{ entry.teacher_name || '—' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span :class="entry.room_name ? '' : 'text-red-600 font-semibold'">
                      {{ entry.room_name || '⚠️ No Room' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusClass(entry.approval_status || entry.status)]">
                      {{ entry.approval_status || entry.status || 'planned' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="previewEntries.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">No entries found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="regenerate" class="btn-secondary flex-1 py-3">
            🔄 Regenerate
          </button>
          <button @click="nextStep" :disabled="hasBlockers" class="btn-primary flex-1 py-3">
            Continue to Approval →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Approve -->
    <div v-if="currentStep === 3" class="card p-8">
      <h2 class="text-2xl font-semibold mb-6">Approve Schedule</h2>

      <div v-if="!approved" class="max-w-2xl space-y-6">
        <div v-if="hasBlockers" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <span class="text-2xl">⚠️</span> Blockers Detected
          </h3>
          <p class="text-sm text-red-800 mb-3">The following issues must be resolved before approval:</p>
          <ul class="list-disc list-inside text-sm text-red-800 space-y-1">
            <li v-for="(blocker, i) in blockers" :key="i">{{ blocker }}</li>
          </ul>
          <button @click="previousStep" class="btn-secondary w-full mt-4">
            ← Go Back to Fix Issues
          </button>
        </div>

        <div v-else>
          <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span class="text-2xl">✓</span> Ready to Approve
            </h3>
            <p class="text-sm text-green-800">All checks passed. You can now approve this schedule.</p>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6" v-if="warnings.length > 0">
            <h3 class="font-semibold text-yellow-900 mb-3">⚡ Warnings (Non-blocking)</h3>
            <ul class="list-disc list-inside text-sm text-yellow-800 space-y-1">
              <li v-for="(warning, i) in warnings" :key="i">{{ warning }}</li>
            </ul>
          </div>

          <div class="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50 mb-6">
            <input type="checkbox" v-model="confirmApproval" id="confirm" class="w-5 h-5" />
            <label for="confirm" class="text-sm font-medium text-blue-900 cursor-pointer">
              I confirm that I have reviewed the schedule and want to approve it for the selected date
            </label>
          </div>

          <button @click="approveSchedule" :disabled="!confirmApproval || loading" class="btn-success w-full py-4 text-lg">
            <span v-if="loading">Approving...</span>
            <span v-else>✅ Approve Schedule</span>
          </button>
          <button @click="previousStep" :disabled="loading" class="btn-secondary w-full py-3 mt-3">
            ← Back to Review
          </button>
        </div>
      </div>

      <div v-else class="max-w-2xl">
        <div class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-2xl font-bold text-green-900 mb-2">Schedule Approved!</h3>
          <p class="text-green-800 mb-6">The schedule for {{ form.date }} has been successfully approved.</p>
          <div class="space-y-3">
            <button @click="createAnother" class="btn-primary w-full py-3">
              Create Another Schedule
            </button>
            <RouterLink to="/admin/day/editor" class="btn-secondary block text-center w-full py-3">
              Go to Day Editor
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DatePicker from '@/components/common/DatePicker.vue'
import { api } from '@/services/api'
import { todayYMD } from '@/utils/format'
import type { DayData } from '@/types/schedule'

const currentStep = ref(0)
const steps = ['Date & Group', 'Configuration', 'Generate', 'Approve']

const form = ref({
  date: todayYMD(),
  group_name: '',
  from_plan: true,
  enforce_no_gaps: true,
  allow_repeated_subjects: true,
  max_repeats_per_subject: 3,
  max_pairs_per_day: 4,
  use_both_shifts: false
})

const loading = ref(false)
const generated = ref(false)
const approved = ref(false)
const confirmApproval = ref(false)
const dayData = ref<DayData | null>(null)
const blockers = ref<string[]>([])
const warnings = ref<string[]>([])

const previewEntries = computed(() => {
  if (!dayData.value) return []
  return (dayData.value.entries || []).slice(0, 10) // Show first 10
})

const hasBlockers = computed(() => blockers.value.length > 0)

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function generate() {
  loading.value = true
  try {
    await api.scheduleDayPlan(form.value)
    dayData.value = await api.getDay({ date: form.value.date, group_name: form.value.group_name || undefined })
    
    // Get report if day has ID
    if (dayData.value?.id) {
      const report = await api.dayReport(dayData.value.id)
      blockers.value = report?.blockers || []
      warnings.value = report?.warnings || []
    }
    
    generated.value = true
  } catch (e) {
    alert('Failed to generate schedule')
  } finally {
    loading.value = false
  }
}

function regenerate() {
  generated.value = false
  dayData.value = null
  blockers.value = []
  warnings.value = []
}

async function approveSchedule() {
  if (!dayData.value?.id) return
  loading.value = true
  try {
    await api.approveDayV2(dayData.value.id, { 
      record_progress: true, 
      enforce_no_blockers: true, 
      group_name: form.value.group_name || undefined 
    })
    approved.value = true
  } catch (e: any) {
    const msg = e?.response?.data?.detail || 'Failed to approve schedule'
    alert(msg)
  } finally {
    loading.value = false
  }
}

function createAnother() {
  currentStep.value = 0
  generated.value = false
  approved.value = false
  confirmApproval.value = false
  dayData.value = null
  blockers.value = []
  warnings.value = []
  form.value.date = todayYMD()
}

function statusClass(status: string | null | undefined) {
  const s = (status || '').toString()
  if (s === 'approved') return 'bg-green-100 text-green-700'
  if (s.includes('replaced')) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}
</script>
